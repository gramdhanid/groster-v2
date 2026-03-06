import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/format";
import type { TopSellingProduct, TimeFilter } from "@/types/dashboard";

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "30days", label: "30 Hari Terakhir" },
  { value: "thisMonth", label: "Bulan Ini" },
];

interface TopSellingProductsProps {
  products: TopSellingProduct[];
  currentTimeFilter?: TimeFilter;
  onTimeFilterChange?: (filter: TimeFilter) => void;
}

/**
 * Top selling products component
 * Displays top products with quantity sold, revenue, and progress bars
 */
export default function TopSellingProducts({
  products,
  currentTimeFilter,
  onTimeFilterChange,
}: TopSellingProductsProps) {
  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="text-primary" size={20} />
            Produk Terlaris
          </CardTitle>
          {onTimeFilterChange && currentTimeFilter && (
            <Select
              value={currentTimeFilter}
              onValueChange={(value) => onTimeFilterChange(value as TimeFilter)}
            >
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-800 border-slate-700 text-white text-xs sm:text-sm">
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
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Belum ada data penjualan
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-slate-200">
                    {product.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">
                    {product.quantitySold} terjual
                  </div>
                  <div className="font-bold text-white">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              </div>
              <Progress
                value={product.percentage}
                className="h-2 bg-slate-800"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
