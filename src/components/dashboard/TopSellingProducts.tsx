import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/format';
import type { TopSellingProduct } from '@/types/dashboard';

interface TopSellingProductsProps {
  products: TopSellingProduct[];
}

/**
 * Top selling products component
 * Displays top products with quantity sold, revenue, and progress bars
 */
export default function TopSellingProducts({
  products,
}: TopSellingProductsProps) {
  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Award className="text-primary" size={20} />
            Produk Terlaris
          </div>
          <span className="text-xs text-slate-500 font-normal">Bulan Ini</span>
        </CardTitle>
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
