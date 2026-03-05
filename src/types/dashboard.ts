/**
 * Dashboard type definitions
 * These types define the data structure for all dashboard components
 */

export interface DailyMetrics {
  revenue: number;
  netProfit: number;
  transactions: number;
  previousRevenue?: number;
  previousProfit?: number;
  previousTransactions?: number;
}

export interface GrowthData {
  revenueGrowth: number; // percentage
  profitGrowth: number;
  transactionGrowth: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  category: string;
  barcode?: string;
}

export type StockStatus = 'critical' | 'low' | 'ok';

export interface TopSellingProduct {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  percentage: number; // relative to top item
}

export type SalesMetric = 'revenue' | 'profit' | 'transactions';
export type TimeFilter = '7days' | '30days' | 'thisMonth';

export interface SalesTrendData {
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number; // Unix timestamp in seconds for uPlot
  revenue: number;
  profit: number;
  transactions: number;
}

export interface SalesTrendResponse {
  data: SalesTrendData[];
  previousPeriodData?: SalesTrendData[];
}
