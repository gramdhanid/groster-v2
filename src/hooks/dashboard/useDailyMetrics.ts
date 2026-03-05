import { useQuery } from '@tanstack/react-query';
import type { DailyMetrics, GrowthData } from '@/types/dashboard';
import { calculateGrowthPercentage } from '@/utils/calculations';

/**
 * Hook for fetching daily business metrics (Revenue, Net Profit, Transactions)
 * Compares today's data with yesterday's for growth calculation
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase queries:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * import { startOfDay, endOfDay, subDays } from 'date-fns';
 *
 * queryFn: async () => {
 *   const today = new Date();
 *   const yesterday = subDays(today, 1);
 *
 *   // Get today's metrics
 *   const { data: todayData } = await supabase
 *     .from('transactions')
 *     .select('total, profit')
 *     .gte('created_at', startOfDay(today).toISOString())
 *     .lte('created_at', endOfDay(today).toISOString());
 *
 *   // Get yesterday's metrics
 *   const { data: yesterdayData } = await supabase
 *     .from('transactions')
 *     .select('total, profit')
 *     .gte('created_at', startOfDay(yesterday).toISOString())
 *     .lte('created_at', endOfDay(yesterday).toISOString());
 *
 *   // Calculate and return metrics...
 * }
 * ```
 */
export const useDailyMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'daily-metrics'],
    queryFn: async (): Promise<{ metrics: DailyMetrics; growth: GrowthData }> => {
      // DUMMY DATA - Replace with Supabase queries when ready
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Today's metrics
      const todayMetrics: DailyMetrics = {
        revenue: 3100000,      // Rp 3.100.000
        netProfit: 930000,     // Rp 930.000 (30% margin)
        transactions: 24,
      };

      // Yesterday's metrics (for growth calculation)
      const yesterdayRevenue = 2950000;   // Rp 2.950.000
      const yesterdayProfit = 850000;     // Rp 850.000
      const yesterdayTransactions = 21;

      return {
        metrics: todayMetrics,
        growth: {
          revenueGrowth: calculateGrowthPercentage(todayMetrics.revenue, yesterdayRevenue),     // +5.08%
          profitGrowth: calculateGrowthPercentage(todayMetrics.netProfit, yesterdayProfit),     // +9.41%
          transactionGrowth: calculateGrowthPercentage(todayMetrics.transactions, yesterdayTransactions), // +14.29%
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
