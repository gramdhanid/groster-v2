import { useQuery } from "@tanstack/react-query";
import { startOfMonth, format } from "date-fns";
import type {
  SalesTrendData,
  SalesTrendResponse,
  TimeFilter,
} from "@/types/dashboard";

export const useSalesTrend = (timeFilter: TimeFilter = "7days") => {
  return useQuery({
    queryKey: ["dashboard", "sales-trend", timeFilter],
    queryFn: async (): Promise<SalesTrendResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const now = new Date();
      let daysToGenerate = 7;

      if (timeFilter === "7days") {
        daysToGenerate = 7;
      } else if (timeFilter === "30days") {
        daysToGenerate = 30;
      } else {
        const startOfCurrentMonth = startOfMonth(now);
        daysToGenerate =
          Math.floor(
            (now.getTime() - startOfCurrentMonth.getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1;
      }

      const baseValues = {
        revenue: 2500000,
        profit: 750000,
        transactions: 20,
      };

      const dataPoints: SalesTrendData[] = [];

      for (let i = daysToGenerate - 1; i >= 0; i--) {
        // Normalize ke midnight LOCAL time
        // uPlot scales.x time:true pakai local timezone untuk posisi tick,
        // jadi timestamp harus midnight local agar label axis dan tooltip sync
        const date = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
          0,
          0,
          0,
          0,
        );

        const dateStr = format(date, "yyyy-MM-dd");

        // Timestamp = midnight local time (bukan UTC)
        // date.getTime() sudah local karena constructor di atas pakai local year/month/day
        const timestamp = Math.floor(date.getTime() / 1000);

        const randomFactor = 0.7 + Math.random() * 0.6;
        const weekendBoost =
          date.getDay() === 0 || date.getDay() === 6 ? 1.2 : 1;

        dataPoints.push({
          date: dateStr,
          timestamp,
          revenue: Math.round(baseValues.revenue * randomFactor * weekendBoost),
          profit: Math.round(baseValues.profit * randomFactor * weekendBoost),
          transactions: Math.round(
            baseValues.transactions * randomFactor * weekendBoost,
          ),
        });
      }

      return { data: dataPoints };
    },
    staleTime: 5 * 60 * 1000,
  });
};
