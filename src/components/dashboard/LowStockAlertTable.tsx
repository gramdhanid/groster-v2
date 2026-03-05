import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PackagePlus } from 'lucide-react';
import type { LowStockProduct } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface LowStockAlertTableProps {
  products: LowStockProduct[];
  onRestock?: (productId: string) => void;
}

/**
 * Low stock alert table component
 * Displays products below minimum stock with status badges and restock actions
 */
export default function LowStockAlertTable({
  products,
  onRestock,
}: LowStockAlertTableProps) {
  const getStockStatus = (product: LowStockProduct): 'critical' | 'low' => {
    return product.currentStock === 0 ? 'critical' : 'low';
  };

  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="text-primary" size={20} />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#0f172a] z-10">
              <TableRow className="border-slate-800 hover:bg-slate-800/20">
                <TableHead className="text-slate-400">Product Name</TableHead>
                <TableHead className="text-slate-400 text-right">Current Stock</TableHead>
                <TableHead className="text-slate-400 text-right">Min Stock</TableHead>
                <TableHead className="text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    All products are well stocked!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        'border-slate-800/50 hover:bg-slate-800/20 transition-colors',
                        status === 'critical' && 'bg-red-950/20'
                      )}
                    >
                      <TableCell className="font-medium text-slate-200">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {product.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-slate-400">
                        {product.minimumStock}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={status === 'critical' ? 'destructive' : 'secondary'}
                          className={
                            status === 'critical'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                          }
                        >
                          {status === 'critical' ? 'Critical' : 'Low'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRestock?.(product.id)}
                          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white"
                        >
                          <PackagePlus size={14} className="mr-1" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
