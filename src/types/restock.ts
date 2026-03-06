import type { LowStockProduct } from './dashboard';

/**
 * Restock feature type definitions
 */

export interface Supplier {
  id: string;
  supplierName: string;
  phoneNumber: string; // Format: "628123456789" (62 country code)
}

export interface RestockOrderItem {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  lastPurchasePrice: number;
  quantity: number; // User input for order quantity
  selected: boolean; // Checkbox state
}

export interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockItems: LowStockProduct[];
  suppliers: Supplier[];
  selectedProductId: string | null;
}
