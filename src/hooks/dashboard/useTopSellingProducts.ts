import { useQuery } from '@tanstack/react-query';
import type { TopSellingProduct, TimeFilter } from '@/types/dashboard';

/**
 * Hook for fetching top selling products by quantity
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase query:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * import { startOfMonth, subDays } from 'date-fns';
 *
 * queryFn: async ({ queryKey }) => {
 *   const [, , timeFilter] = queryKey;
 *   const startDate = timeFilter === '7days'
 *     ? subDays(new Date(), 7).toISOString()
 *     : timeFilter === '30days'
 *     ? subDays(new Date(), 30).toISOString()
 *     : startOfMonth(new Date()).toISOString();
 *
 *   const { data, error } = await supabase
 *     .from('transaction_items')
 *     .select('product_id, product_name, qty, subtotal')
 *     .gte('created_at', startDate)
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
export const useTopSellingProducts = (
  limit: number = 5,
  timeFilter: TimeFilter = '7days'
) => {
  return useQuery({
    queryKey: ['dashboard', 'top-selling', limit, timeFilter],
    queryFn: async (): Promise<TopSellingProduct[]> => {
      // DUMMY DATA - Replace with Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 400));

      // Generate different dummy data based on time filter
      const getDummyData = (filter: TimeFilter) => {
        switch (filter) {
          case '7days':
            // Higher daily quantities (7 days worth)
            return [
              { name: 'Indomie Goreng', qty: 112, revenue: 392000 },
              { name: 'Teh Pucuk Harum 350ml', qty: 84, revenue: 336000 },
              { name: 'Telur Ayam (Kg)', qty: 38, revenue: 1064000 },
              { name: 'Beras Raja Lele 5kg', qty: 19, revenue: 1425000 },
              { name: 'Kopi Kapal Api', qty: 48, revenue: 72000 },
            ];
          case '30days':
            // Medium daily quantities (30 days worth)
            return [
              { name: 'Indomie Goreng', qty: 180, revenue: 630000 },
              { name: 'Teh Pucuk Harum 350ml', qty: 135, revenue: 540000 },
              { name: 'Telur Ayam (Kg)', qty: 62, revenue: 1736000 },
              { name: 'Beras Raja Lele 5kg', qty: 31, revenue: 2325000 },
              { name: 'Kopi Kapal Api', qty: 78, revenue: 117000 },
            ];
          case 'thisMonth':
            // Accumulated from start of month
            return [
              { name: 'Indomie Goreng', qty: 245, revenue: 857500 },
              { name: 'Teh Pucuk Harum 350ml', qty: 180, revenue: 720000 },
              { name: 'Telur Ayam (Kg)', qty: 85, revenue: 2380000 },
              { name: 'Beras Raja Lele 5kg', qty: 42, revenue: 3150000 },
              { name: 'Kopi Kapal Api', qty: 110, revenue: 165000 },
            ];
        }
      };

      const dummyData = getDummyData(timeFilter);
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
