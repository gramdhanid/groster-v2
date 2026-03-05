import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { formatCurrency } from "../../utils/format";

interface LineChartProps {
  data: [number[], number[]]; // [x-values (timestamps), y-values]
  width?: number;
  height?: number;
  formatValue?: (value: number) => string;
  primaryColor?: string;
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
          stroke: "#cbd5e1", // Ganti ke warna terang (misal: slate-300) atau "#fff"
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
          // Sumbu Y (Angka/Pendapatan)
          stroke: "#cbd5e1", // Ganti ke warna terang atau "#fff"
          grid: { stroke: "#334155", width: 1 },
          ticks: { stroke: "#475569" },
          values: (_u, vals) =>
            vals.map((v) => {
              console.log("This Value Y: ", v);
              if (v == null) return "-";
              if (formatValue) return formatValue(v);
              if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
              if (v >= 1000) return (v / 1000).toFixed(0) + "K";
              return String(v);
            }),
        },
      ],
      series: [
        {},
        {
          stroke: primaryColor,
          fill: `${primaryColor}20`, // Add transparency for area fill
          width: 2,
          value: (_u, v) =>
            v == null ? "-" : formatValue ? formatValue(v) : formatCurrency(v),
        },
      ],
      cursor: {
        points: { size: 8, fill: "#fff", stroke: primaryColor, width: 2 },
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
    };

    uplotRef.current = new uPlot(
      opts,
      data as uPlot.AlignedData,
      chartRef.current,
    );

    return () => {
      if (uplotRef.current) uplotRef.current.destroy();
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

  return <div ref={chartRef} className="w-full relative text-white" />;
}
