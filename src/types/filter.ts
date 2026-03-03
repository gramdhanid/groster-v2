/**
 * Filter types for product filtering functionality
 */

export interface ProductFilters {
  categories: string[]; // Multiple selected categories (empty = all categories)
  priceRange: [number, number]; // [min, max] price range
  stockFilter: StockFilterType; // Stock level filter
}

export type StockFilterType = "all" | "low" | "medium" | "high";

export interface StockFilterOption {
  value: StockFilterType;
  label: string;
  description: string;
  color: string;
  showRing?: boolean; // Whether to show selection ring (green border)
}
