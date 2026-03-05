import { useQuery } from '@tanstack/react-query';
import { startOfMonth, format } from 'date-fns';
import type { SalesTrendData, SalesTrendResponse, TimeFilter } from '@/types/dashboard';

/**
 * Hook for fetching sales trend data grouped by date
 * Supports multiple time filters and metrics
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase queries:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * import { subDays, startOfMonth, format } from 'date-fns';
 *
 * queryFn: async () => {
 *   const now = new Date();
 *   let startDate: Date;
 *
 *   if (timeFilter === '7days') {
 *     startDate = subDays(now, 7);
 *   } else if (timeFilter === '30days') {
 *     startDate = subDays(now, 30);
 *   } else {
 *     startDate = startOfMonth(now);
 *   }
 *
 *   const { data, error } = await supabase
 *     .from('transactions')
 *     .select('created_at, total, profit')
 *     .gte('created_at', startDate.toISOString())
 *     .lte('created_at', now.toISOString())
 *     .order('created_at', { ascending: true });
 *
 *   if (error) throw error;
 *
 *   // Group by date and return...
 * }
 * ```
 */
export const useSalesTrend = (timeFilter: TimeFilter = '7days') => {
  return useQuery({
    queryKey: ['dashboard', 'sales-trend', timeFilter],
    queryFn: async (): Promise<SalesTrendResponse> => {
      // DUMMY DATA - Replace with Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 600));

      const now = new Date();
      let dataPoints: SalesTrendData[] = [];
      let daysToGenerate = 7;

      if (timeFilter === '7days') {
        daysToGenerate = 7;
      } else if (timeFilter === '30days') {
        daysToGenerate = 30;
      } else {
        // This month - generate days from start of month
        const startOfCurrentMonth = startOfMonth(now);
        daysToGenerate = Math.floor((now.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      // Generate dummy trend data
      const baseValues = {
        revenue: 2500000,  // Base revenue
        profit: 750000,    // Base profit (30% margin)
        transactions: 20,  // Base transactions
      };

      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const timestamp = Math.floor(date.getTime() / 1000);

        // Add some randomness to create realistic trends
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        const weekendBoost = (date.getDay() === 0 || date.getDay() === 6) ? 1.2 : 1;

        dataPoints.push({
          date: dateStr,
          timestamp,
          revenue: Math.round(baseValues.revenue * randomFactor * weekendBoost),
          profit: Math.round(baseValues.profit * randomFactor * weekendBoost),
          transactions: Math.round(baseValues.transactions * randomFactor * weekendBoost),
        });
      }

      return {
        data: dataPoints,
        // previousPeriodData would be populated with Supabase query
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
