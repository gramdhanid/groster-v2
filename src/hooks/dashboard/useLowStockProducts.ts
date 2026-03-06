import { useQuery } from '@tanstack/react-query';
import type { LowStockProduct } from '@/types/dashboard';

/**
 * Hook for fetching products that are below minimum stock level
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase query:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 *
 * queryFn: async () => {
 *   const { data, error } = await supabase
 *     .from('products')
 *     .select('id, name, stock_qty, min_stock, category, barcode')
 *     .lte('stock_qty', supabase.raw('min_stock'))
 *     .order('stock_qty', { ascending: true })
 *     .limit(20);
 *
 *   if (error) throw error;
 *   return data as LowStockProduct[];
 * }
 * ```
 */
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: async (): Promise<LowStockProduct[]> => {
      // DUMMY DATA - Replace with Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));

      return [
        {
          id: '1',
          name: 'Kopi Kapal Api Sachet',
          currentStock: 0,
          minimumStock: 10,
          category: 'Minuman',
          barcode: '8991234567890',
          lastPurchasePrice: 1500,
        },
        {
          id: '2',
          name: 'Gula Pasir 1kg',
          currentStock: 2,
          minimumStock: 5,
          category: 'Sembako',
          barcode: '8991234567891',
          lastPurchasePrice: 12500,
        },
        {
          id: '3',
          name: 'Minyak Goreng 1L',
          currentStock: 3,
          minimumStock: 8,
          category: 'Sembako',
          barcode: '8991234567892',
          lastPurchasePrice: 16000,
        },
        {
          id: '4',
          name: 'Teh Pucuk Harum 350ml',
          currentStock: 5,
          minimumStock: 12,
          category: 'Minuman',
          barcode: '8991234567893',
          lastPurchasePrice: 3500,
        },
        {
          id: '5',
          name: 'Indomie Goreng',
          currentStock: 8,
          minimumStock: 15,
          category: 'Mie Instan',
          barcode: '8991234567894',
          lastPurchasePrice: 3500,
        },
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
