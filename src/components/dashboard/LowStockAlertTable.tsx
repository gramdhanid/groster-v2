import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import type { LowStockProduct } from "@/types/dashboard";

interface LowStockAlertTableProps {
  products: LowStockProduct[];
  onRestock?: (productId: string) => void;
}

/**
 * Low stock alert component
 * Displays products below minimum stock with status badges and restock actions
 */
export default function LowStockAlertTable({
  products,
  onRestock,
}: LowStockAlertTableProps) {
  const getStockStatus = (product: LowStockProduct): "critical" | "low" => {
    return product.currentStock === 0 ? "critical" : "low";
  };

  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="text-primary" size={20} />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {products.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            All products are well stocked!
          </div>
        ) : (
          products.map((product) => {
            const status = getStockStatus(product);
            return (
              <div
                key={product.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  status === "critical"
                    ? "bg-red-950/20 hover:bg-red-950/30"
                    : "hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-medium text-slate-200 truncate">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge
                    variant={
                      status === "critical" ? "destructive" : "secondary"
                    }
                    className={
                      status === "critical"
                        ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                    }
                  >
                    {product.currentStock} / {product.minimumStock}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRestock?.(product.id)}
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white"
                  >
                    <PackagePlus size={14} className="mr-1" />
                    Restock
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
