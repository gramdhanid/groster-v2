import { useQuery } from '@tanstack/react-query';
import type { TopSellingProduct } from '@/types/dashboard';

/**
 * Hook for fetching top selling products by quantity
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase query:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * import { startOfMonth } from 'date-fns';
 *
 * queryFn: async () => {
 *   const { data, error } = await supabase
 *     .from('transaction_items')
 *     .select('product_id, product_name, qty, subtotal')
 *     .gte('created_at', startOfMonth(new Date()).toISOString())
 *     .order('qty', { ascending: false })
 *     .limit(limit);
 *
 *   if (error) throw error;
 *
 *   const maxQty = data[0]?.qty || 1;
 *
 *   return data.map((item) => ({
 *     id: item.product_id,
 *     name: item.product_name,
 *     quantitySold: item.qty,
 *     revenue: item.subtotal,
 *     percentage: (item.qty / maxQty) * 100,
 *   }));
 * }
 * ```
 */
export const useTopSellingProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'top-selling', limit],
    queryFn: async (): Promise<TopSellingProduct[]> => {
      // DUMMY DATA - Replace with Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 400));

      const dummyData = [
        { name: 'Indomie Goreng', qty: 245, revenue: 857500 },
        { name: 'Teh Pucuk Harum 350ml', qty: 180, revenue: 720000 },
        { name: 'Telur Ayam (Kg)', qty: 85, revenue: 2380000 },
        { name: 'Beras Raja Lele 5kg', qty: 42, revenue: 3150000 },
        { name: 'Kopi Kapal Api', qty: 110, revenue: 165000 },
      ];

      const maxQty = dummyData[0].qty;

      return dummyData.map((item, index) => ({
        id: String(index + 1),
        name: item.name,
        quantitySold: item.qty,
        revenue: item.revenue,
        percentage: (item.qty / maxQty) * 100,
      }));
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
