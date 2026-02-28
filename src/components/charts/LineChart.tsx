import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { formatCurrency } from '../../utils/format';

interface LineChartProps {
    data: [number[], number[]]; // [x-values (timestamps), y-values]
    width?: number;
    height?: number;
}

export default function LineChart({ data, width = 0, height = 300 }: LineChartProps) {
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
                    grid: { show: false },
                },
                {
                    grid: { stroke: '#eee', width: 1 },
                    values: (u, vals) => vals.map(v => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)),
                }
            ],
            series: [
                {},
                {
                    stroke: '#10b981', // Tailwind primary
                    fill: 'rgba(16, 185, 129, 0.1)',
                    width: 2,
                    value: (u, v) => v == null ? '-' : formatCurrency(v),
                }
            ],
            cursor: {
                points: { size: 8, fill: '#fff', stroke: '#10b981', width: 2 }
            }
        };

        uplotRef.current = new uPlot(opts, data as uPlot.AlignedData, chartRef.current);

        return () => {
            if (uplotRef.current) uplotRef.current.destroy();
        };
    }, [data, width, height]);

    // Handle resize gracefully
    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && uplotRef.current && width === 0) {
                uplotRef.current.setSize({
                    width: chartRef.current.clientWidth,
                    height: height
                });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [width, height]);

    return <div ref={chartRef} className="w-full relative" />;
}
