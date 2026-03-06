import { useEffect, useRef, useState, useCallback } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { formatCurrency, formatCompactNumber } from "../../utils/format";

interface LineChartProps {
  data: [number[], number[]]; // [x-values (timestamps), y-values]
  width?: number;
  height?: number;
  formatValue?: (value: number) => string;
  primaryColor?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  value: string;
}

export default function LineChart({
  data,
  width = 0,
  height = 300,
  formatValue,
  primaryColor = "#10b981",
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const indicatorLineRef = useRef<HTMLDivElement>(null);
  const circleIndicatorRef = useRef<HTMLDivElement>(null);
  const chartWidthRef = useRef<number>(0);

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    date: "",
    value: "",
  });

  // Build uPlot options — wrapped in useCallback agar stable reference
  const buildOpts = useCallback(
    (actualWidth: number): uPlot.Options => ({
      width: actualWidth,
      height,
      axes: [
        {
          stroke: "#cbd5e1",
          grid: { show: false },
          ticks: { stroke: "#475569" },
          values: (_u, splits) =>
            splits.map((v) =>
              new Date(v * 1000).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              }),
            ),
        },
        {
          stroke: "#cbd5e1",
          grid: { stroke: "#334155", width: 1 },
          ticks: { stroke: "#475569" },
          size: 70,
          values: (_u, vals) =>
            vals.map((v) => {
              if (v == null) return "-";
              if (formatValue) return formatCompactNumber(v);
              if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + " Jt";
              if (v >= 1_000) return (v / 1_000).toFixed(0) + "rb";
              return String(v);
            }),
        },
      ],
      series: [
        {},
        {
          stroke: primaryColor,
          fill: `${primaryColor}20`,
          width: 2,
          value: (_u, v) =>
            v == null ? "-" : formatValue ? formatValue(v) : formatCurrency(v),
          points: { show: false },
        },
      ],
      cursor: {
        points: { show: false },
        // Biarkan uPlot tracking cursor secara internal
        // x/y: false akan disable default cursor rendering, tapi kita butuh
        // idx tracking — jadi jangan disable x
        x: true,
        y: false,
        drag: { setScale: false }, // disable zoom drag, ini POS bukan analytics
      },
      scales: {
        x: { time: true },
        y: {
          range: (_u, min, max) => {
            const padding = (max - min) * 0.1 || max * 0.1;
            return [Math.max(0, min - padding), max + padding];
          },
        },
      },
      plugins: [
        {
          hooks: {
            setCursor: [
              (u) => {
                const idx = u.cursor.idx;

                if (idx == null || idx < 0) {
                  indicatorLineRef.current?.classList.add("opacity-0");
                  circleIndicatorRef.current?.classList.add("opacity-0");
                  tooltipRef.current?.classList.add("opacity-0");
                  return;
                }

                const [xData, yData] = data;
                const xVal = xData[idx];
                const yVal = yData[idx];
                if (xVal == null || yVal == null) return;

                // Hitung offset u-over relatif ke containerRef
                // u-over = area plot interaktif, punya offset karena Y-axis label di kiri
                const containerEl = containerRef.current;
                const over = u.root.querySelector<HTMLElement>(".u-over");
                let canvasOffsetLeft = 0;
                let canvasOffsetTop = 0;
                if (containerEl && over) {
                  const containerRect = containerEl.getBoundingClientRect();
                  const overRect = over.getBoundingClientRect();
                  canvasOffsetLeft = overRect.left - containerRect.left;
                  canvasOffsetTop = overRect.top - containerRect.top;
                }

                // X: pakai cursor.left — ini snap ke data point, relatif ke u-over
                const xPos = (u.cursor.left ?? 0) + canvasOffsetLeft;

                // Y: JANGAN pakai cursor.top — itu ikut posisi mouse, bukan nilai data
                // valToPos(false) = koordinat relatif ke u-over plot area
                const yPos = u.valToPos(yVal, "y", false) + canvasOffsetTop;

                // Update indicator line
                if (indicatorLineRef.current) {
                  indicatorLineRef.current.style.left = `${xPos}px`;
                  indicatorLineRef.current.classList.remove("opacity-0");
                }

                // Update circle indicator
                if (circleIndicatorRef.current) {
                  circleIndicatorRef.current.style.left = `${xPos}px`;
                  circleIndicatorRef.current.style.top = `${yPos}px`;
                  circleIndicatorRef.current.classList.remove("opacity-0");
                }

                // Format values
                const dateStr = new Date(xVal * 1000).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                  },
                );
                const valueStr = formatValue
                  ? formatValue(yVal)
                  : formatCurrency(yVal);

                setTooltip({
                  visible: true,
                  x: xPos,
                  y: yPos,
                  date: dateStr,
                  value: valueStr,
                });

                // Position tooltip — prevent overflow
                if (tooltipRef.current) {
                  const tooltipWidth = tooltipRef.current.offsetWidth || 140;
                  const currentWidth = chartWidthRef.current;

                  let tooltipLeft = xPos + 14;
                  if (tooltipLeft + tooltipWidth > currentWidth) {
                    tooltipLeft = xPos - tooltipWidth - 14;
                  }
                  if (tooltipLeft < 0) tooltipLeft = 8;

                  let tooltipTop = yPos - 12;
                  if (tooltipTop < 0) tooltipTop = 8;
                  if (tooltipTop + 60 > height) tooltipTop = height - 68;

                  tooltipRef.current.style.left = `${tooltipLeft}px`;
                  tooltipRef.current.style.top = `${tooltipTop}px`;
                  tooltipRef.current.classList.remove("opacity-0");
                }
              },
            ],
          },
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [height, primaryColor, formatValue],
    // data sengaja tidak masuk deps sini — data di-handle lewat uplot.setData()
  );

  // Init atau rebuild chart
  const initChart = useCallback(
    (containerEl: HTMLDivElement, actualWidth: number) => {
      // Destroy instance lama
      if (uplotRef.current) {
        uplotRef.current.destroy();
        uplotRef.current = null;
      }
      // Clear container dari sisa DOM uPlot
      containerEl.innerHTML = "";

      chartWidthRef.current = actualWidth;
      const opts = buildOpts(actualWidth);

      uplotRef.current = new uPlot(
        opts,
        data as uPlot.AlignedData,
        containerEl,
      );

      // Mouse enter/leave untuk show/hide indicators
      const over = containerEl.querySelector<HTMLElement>(".u-over");
      if (over) {
        const show = () => {
          indicatorLineRef.current?.classList.remove("opacity-0");
          circleIndicatorRef.current?.classList.remove("opacity-0");
        };
        const hide = () => {
          indicatorLineRef.current?.classList.add("opacity-0");
          circleIndicatorRef.current?.classList.add("opacity-0");
          tooltipRef.current?.classList.add("opacity-0");
        };
        over.addEventListener("mouseenter", show);
        over.addEventListener("mouseleave", hide);

        // Simpan cleanup di instance
        (uplotRef.current as any)._cleanup = () => {
          over.removeEventListener("mouseenter", show);
          over.removeEventListener("mouseleave", hide);
        };
      }
    },
    [buildOpts, data],
  );

  // Effect: rebuild saat opts berubah (height, color, formatValue)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const actualWidth = width > 0 ? width : container.clientWidth || 300;

    initChart(container, actualWidth);

    return () => {
      if (uplotRef.current) {
        (uplotRef.current as any)._cleanup?.();
        uplotRef.current.destroy();
        uplotRef.current = null;
      }
    };
  }, [initChart, width]);

  // Effect: update data tanpa rebuild chart
  useEffect(() => {
    if (uplotRef.current) {
      uplotRef.current.setData(data as uPlot.AlignedData);
    }
  }, [data]);

  // ResizeObserver — jauh lebih reliable dari window resize event
  useEffect(() => {
    if (width > 0) return; // width manual, skip observer

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = Math.floor(entry.contentRect.width);
      if (
        newWidth > 0 &&
        newWidth !== chartWidthRef.current &&
        uplotRef.current
      ) {
        chartWidthRef.current = newWidth;
        uplotRef.current.setSize({ width: newWidth, height });
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [width, height]);

  return (
    <div
      className="w-full relative text-white"
      style={{ height: `${height}px` }}
    >
      {/* Container uPlot — absolute agar overlay indicators bisa positioning dengan benar */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Vertical Indicator Line */}
      <div
        ref={indicatorLineRef}
        className="absolute pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          top: 0,
          bottom: 0,
          width: "1px",
          borderLeft: "1px dashed rgba(255,255,255,0.4)",
          transform: "translateX(-50%)",
        }}
      />

      {/* Circle Indicator */}
      <div
        ref={circleIndicatorRef}
        className="absolute w-4 h-4 rounded-full border-2 bg-white pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 8px ${primaryColor}80`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-slate-800/95 border border-slate-600 rounded-lg px-3 py-2 pointer-events-none opacity-0 transition-opacity duration-150 shadow-lg z-10 min-w-[130px]"
        style={{ left: 0, top: 0 }}
      >
        <div className="text-xs text-slate-400 mb-1">{tooltip.date}</div>
        <div className="text-sm font-semibold text-white">{tooltip.value}</div>
      </div>
    </div>
  );
}
