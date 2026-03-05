import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LineChart from "@/components/charts/LineChart";
import type {
  SalesTrendResponse,
  SalesMetric,
  TimeFilter,
} from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";

interface SalesTrendChartProps {
  data: SalesTrendResponse;
  onTimeFilterChange: (filter: TimeFilter) => void;
  currentTimeFilter: TimeFilter;
}

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "30days", label: "30 Hari Terakhir" },
  { value: "thisMonth", label: "Bulan Ini" },
];

const metrics: { value: SalesMetric; label: string }[] = [
  { value: "revenue", label: "Pendapatan" },
  { value: "profit", label: "Laba Bersih" },
  { value: "transactions", label: "Jumlah Transaksi" },
];

/**
 * Sales trend chart component
 * Displays sales data with time filters and metric toggles
 */
export default function SalesTrendChart({
  data,
  onTimeFilterChange,
  currentTimeFilter,
}: SalesTrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<SalesMetric>("revenue");

  // Convert data to uPlot format: [timestamps[], values[]]
  const chartData: [number[], number[]] = [
    data.data.map((d) => d.timestamp),
    data.data.map((d) => {
      switch (selectedMetric) {
        case "revenue":
          return d.revenue;
        case "profit":
          return d.profit;
        case "transactions":
          return d.transactions;
      }
    }),
  ];

  // Format function based on selected metric
  const formatValue = (value: number): string => {
    if (selectedMetric === "transactions") {
      return String(value);
    }
    return formatCurrency(value);
  };

  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="text-primary" size={20} />
            Sales Trend Analysis
          </CardTitle>
          <div className="flex flex-wrap gap-5">
            {/* Time Filter Dropdown */}
            <Select
              value={currentTimeFilter}
              onValueChange={(value) => onTimeFilterChange(value as TimeFilter)}
            >
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {timeFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Metric Dropdown */}
            <Select
              value={selectedMetric}
              onValueChange={(value) => setSelectedMetric(value as SalesMetric)}
            >
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Pilih metrik" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <LineChart data={chartData} height={250} formatValue={formatValue} />
      </CardContent>
    </Card>
  );
}
