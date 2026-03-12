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
  data?: SalesTrendResponse;
  isLoading?: boolean;
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
  isLoading = false,
  onTimeFilterChange,
  currentTimeFilter,
}: SalesTrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<SalesMetric>("revenue");

  // Convert data to uPlot format: [timestamps[], values[]]
  const chartData: [number[], number[]] = data
    ? [
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
      ]
    : [[], []];

  // Format function based on selected metric
  const formatValue = (value: number): string => {
    if (selectedMetric === "transactions") {
      return String(value);
    }
    return formatCurrency(value);
  };

  return (
    <Card className="bg-[#0f172a] border-slate-800 hover:border-primary/50 transition-colors duration-200">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="bg-gradient-to-br from-primary to-green-600 p-1.5 rounded-lg">
              <TrendingUp className="text-white" size={16} />
            </div>
            Analisis Tren Penjualan
          </CardTitle>
          <div className="flex w-full sm:w-auto flex-wrap items-end gap-1.5 sm:gap-3">
            {/* Time Filter Dropdown */}
            <Select
              value={currentTimeFilter}
              onValueChange={(value) => onTimeFilterChange(value as TimeFilter)}
            >
              <SelectTrigger className="flex-1 sm:w-[140px] bg-slate-800/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent border-slate-700 text-white text-xs sm:text-sm transition-all">
                <SelectValue placeholder="Filter" />
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
              <SelectTrigger className="flex-1 sm:w-[140px] bg-slate-800/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent border-slate-700 text-white text-xs sm:text-sm transition-all">
                <SelectValue placeholder="Metrik" />
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
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-transparent border-t-primary rounded-full animate-spin bg-gradient-to-br from-primary/20 to-green-600/20" />
              <p className="text-sm text-slate-400">Memuat data...</p>
            </div>
          </div>
        ) : (
          <LineChart data={chartData} height={250} formatValue={formatValue} />
        )}
      </CardContent>
    </Card>
  );
}
