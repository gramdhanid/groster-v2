import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackagePlus, ChevronRight } from "lucide-react";
import type { LowStockProduct } from "@/types/dashboard";

interface LowStockAlertTableProps {
  products: LowStockProduct[];
  onRestock?: (productId: string) => void;
  onProductClick?: (product: LowStockProduct) => void;
}

/**
 * Low stock alert component
 * Displays products below minimum stock with status badges and restock actions
 *
 * Accessibility features:
 * - Entire row is clickable with keyboard support
 * - Clear Indonesian text for stock status
 * - 44px+ touch targets
 * - ARIA labels for screen readers
 */
export default function LowStockAlertTable({
  products,
  onRestock,
  onProductClick,
}: LowStockAlertTableProps) {
  const getStockStatus = (product: LowStockProduct): "critical" | "low" => {
    return product.currentStock === 0 ? "critical" : "low";
  };

  const getStockStatusLabel = (product: LowStockProduct): string => {
    // if (product.currentStock === 0) {
    //   return " Habis";
    // }
    return `${product.currentStock} / ${product.minimumStock}`;
  };

  const handleRowClick = (product: LowStockProduct) => {
    onProductClick?.(product);
  };

  const handleRowKeyDown = (
    e: React.KeyboardEvent,
    product: LowStockProduct,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onProductClick?.(product);
    }
  };

  const handleRestockClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onRestock?.(productId);
  };

  const handleRestockKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onRestock?.(productId);
    }
  };

  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="text-primary" size={20} />
          Stok Menipis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {products.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Semua produk stoknya aman!
          </div>
        ) : (
          products.map((product) => {
            const status = getStockStatus(product);
            const stockLabel = getStockStatusLabel(product);
            return (
              <div
                key={product.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                  status === "critical"
                    ? "bg-red-950/20 hover:bg-red-950/40 focus:bg-red-950/40"
                    : "bg-slate-900/30 hover:bg-slate-800/40 focus:bg-slate-800/40"
                }`}
                onClick={() => handleRowClick(product)}
                onKeyDown={(e) => handleRowKeyDown(e, product)}
                role="button"
                tabIndex={0}
                aria-label={`Lihat detail ${product.name}. ${stockLabel}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-slate-200 truncate text-sm">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge
                    variant={
                      status === "critical" ? "destructive" : "secondary"
                    }
                    className={`min-h-[36px] px-2 text-xs font-medium whitespace-nowrap ${
                      status === "critical"
                        ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                        : "bg-[hsl(var(--yellow)/0.2)] text-[hsl(var(--yellow))] border-[hsl(var(--yellow)/0.3)] hover:bg-[hsl(var(--yellow)/0.3)]"
                    }`}
                  >
                    {stockLabel}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleRestockClick(e, product.id)}
                    onKeyDown={(e) => handleRestockKeyDown(e, product.id)}
                    className="min-h-[36px] min-w-[36px] p-0 w-9 h-9 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white focus:ring-2 focus:ring-primary focus:outline-none flex items-center justify-center"
                    aria-label={`Restock ${product.name}`}
                  >
                    <PackagePlus size={16} />
                  </Button>
                  <ChevronRight
                    className="text-slate-500 flex-shrink-0"
                    size={18}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
