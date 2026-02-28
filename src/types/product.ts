export const PRODUCT_CATEGORIES = [
    "Rokok & Tembakau",
    "Minuman",
    "Mie & Snack",
    "Sembako",
    "Kebutuhan Rumah Tangga",
    "Susu & Produk Bayi",
    "Personal Care",
    "Bumbu Dapur",
    "Obat & Kesehatan",
    "Frozen Food",
    "Lain-lain"
] as const;

export type PredefinedCategory = typeof PRODUCT_CATEGORIES[number];
export type ProductCategory = PredefinedCategory | string;

export interface ProductUnit {
    id: string;
    unit_type: string;
    price_sell: number;
    price_cost: number;
    qty_per_base_unit: number;
    is_default: boolean;
}

export interface Product {
    id: string;
    name: string;
    category: ProductCategory;
    barcode?: string;
    units: ProductUnit[];
    stock_qty: number;
}
