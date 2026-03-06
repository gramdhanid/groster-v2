import { useEffect, useRef, useState } from "react";
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
  const chartRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const indicatorLineRef = useRef<HTMLDivElement>(null);
  const circleIndicatorRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    date: "",
    value: "",
  });

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous instance
    if (uplotRef.current) {
      uplotRef.current.destroy();
    }

    // Measure actual width if not provided
    const actualWidth = width > 0 ? width : chartRef.current.clientWidth;

    const opts: uPlot.Options = {
      width: actualWidth,
      height,
      axes: [
        {
          // Sumbu X (Tanggal)
          stroke: "#cbd5e1",
          grid: { show: false },
          ticks: { stroke: "#475569" },
          values: (_u, splits) => {
            return splits.map((v) => {
              const date = new Date(v * 1000);
              return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });
            });
          },
        },
        {
          // Sumbu Y (Angka/Pendapatan) dengan format Indonesian (Jt, rb)
          stroke: "#cbd5e1",
          grid: { stroke: "#334155", width: 1 },
          ticks: { stroke: "#475569" },
          size: 70,
          values: (_u, vals) =>
            vals.map((v) => {
              if (v == null) return "-";
              if (formatValue) {
                // Gunakan format compact untuk axis Y
                return formatCompactNumber(v);
              }
              // Default fallback dengan format Indonesian
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
          points: {
            show: false,
          },
        },
      ],
      cursor: {
        points: { show: false },
        x: false,
        y: false,
        drag: { setScale: true },
      },
      scales: {
        x: {
          time: true,
        },
        y: {
          range: (_u, min, max) => {
            // Add padding to the range
            const padding = (max - min) * 0.1;
            return [min - padding, max + padding];
          },
        },
      },
      plugins: [
        {
          hooks: {
            setCursor: [
              (u) => {
                const idx = u.cursor.idx;
                if (idx != null) {
                  const [xData, yData] = data;
                  const xVal = xData[idx];
                  const yVal = yData[idx];

                  // Get cursor position
                  const cursorLeft = u.cursor.left ?? 0;
                  const cursorTop = u.cursor.top ?? 0;

                  // Calculate position for indicator line and circle
                  const bbox = (u.root?.firstElementChild as HTMLElement)?.getBoundingClientRect();
                  if (bbox) {
                    // Update indicator line position
                    if (indicatorLineRef.current) {
                      indicatorLineRef.current.style.left = `${cursorLeft}px`;
                    }

                    // Update circle indicator position at the data point
                    if (circleIndicatorRef.current && yVal != null) {
                      const yPos = u.valToPos(yVal, "y", true);
                      circleIndicatorRef.current.style.left = `${cursorLeft}px`;
                      circleIndicatorRef.current.style.top = `${yPos}px`;
                    }

                    // Format date
                    const date = new Date(xVal * 1000);
                    const dateStr = date.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    // Format value
                    const valueStr =
                      yVal != null
                        ? formatValue
                          ? formatValue(yVal)
                          : formatCurrency(yVal)
                        : "-";

                    // Update tooltip
                    setTooltip({
                      visible: true,
                      x: cursorLeft,
                      y: cursorTop,
                      date: dateStr,
                      value: valueStr,
                    });

                    // Position tooltip - keep it within bounds
                    if (tooltipRef.current) {
                      const tooltipWidth = tooltipRef.current.offsetWidth;
                      let tooltipLeft = cursorLeft + 12;

                      // Adjust if tooltip would go off the right edge
                      if (tooltipLeft + tooltipWidth > actualWidth) {
                        tooltipLeft = cursorLeft - tooltipWidth - 12;
                      }

                      // Don't let tooltip go off the left edge either
                      if (tooltipLeft < 0) {
                        tooltipLeft = 12;
                      }

                      tooltipRef.current.style.left = `${tooltipLeft}px`;

                      // Position tooltip near the data point
                      let tooltipTop = cursorTop - 12;
                      if (tooltipTop < 0) tooltipTop = 12;
                      if (tooltipTop + 60 > height) tooltipTop = height - 72;

                      tooltipRef.current.style.top = `${tooltipTop}px`;
                    }
                  }
                }
              },
            ],
          },
        },
      ],
    };

    uplotRef.current = new uPlot(
      opts,
      data as uPlot.AlignedData,
      chartRef.current,
    );

    // Add mouse event handlers for tooltip visibility
    const chartEl = chartRef.current?.querySelector("canvas")?.parentElement;
    if (chartEl) {
      const handleMouseEnter = () => {
        tooltipRef.current?.classList.remove("opacity-0");
        indicatorLineRef.current?.classList.remove("opacity-0");
        circleIndicatorRef.current?.classList.remove("opacity-0");
      };
      const handleMouseLeave = () => {
        tooltipRef.current?.classList.add("opacity-0");
        indicatorLineRef.current?.classList.add("opacity-0");
        circleIndicatorRef.current?.classList.add("opacity-0");
      };
      chartEl.addEventListener("mouseenter", handleMouseEnter);
      chartEl.addEventListener("mouseleave", handleMouseLeave);

      // Store cleanup
      (uplotRef.current as any)._mouseHandlers = {
        remove: () => {
          chartEl.removeEventListener("mouseenter", handleMouseEnter);
          chartEl.removeEventListener("mouseleave", handleMouseLeave);
        },
      };
    }

    return () => {
      if (uplotRef.current) {
        if ((uplotRef.current as any)._mouseHandlers) {
          (uplotRef.current as any)._mouseHandlers.remove();
        }
        uplotRef.current.destroy();
      }
    };
  }, [data, width, height, formatValue, primaryColor]);

  // Handle resize gracefully
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && uplotRef.current && width === 0) {
        uplotRef.current.setSize({
          width: chartRef.current.clientWidth,
          height: height,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  return (
    <div ref={chartRef} className="w-full relative text-white">
      {/* Vertical Indicator Line */}
      <div
        ref={indicatorLineRef}
        className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/50 pointer-events-none opacity-0 transition-opacity duration-150"
        style={{ left: 0 }}
      />

      {/* Circle Indicator at Data Point */}
      <div
        ref={circleIndicatorRef}
        className="absolute w-4 h-4 rounded-full border-2 bg-white pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 8px ${primaryColor}80`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Custom Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-slate-800/95 border border-slate-600 rounded-lg px-3 py-2 pointer-events-none opacity-0 transition-opacity duration-150 shadow-lg z-10 min-w-[120px]"
        style={{ left: 0, top: 0 }}
      >
        <div className="text-xs text-slate-400 mb-1">{tooltip.date}</div>
        <div className="text-sm font-semibold text-white">{tooltip.value}</div>
      </div>
    </div>
  );
}
