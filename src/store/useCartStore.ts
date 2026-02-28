import { create } from 'zustand';

export interface ProductUnit {
    id: string;
    unit_type: string;
    price_sell: number;
    price_cost: number;
    qty_per_base_unit: number;
}

export interface CartItem {
    cart_id: string; // unique for list
    product_id: string;
    product_name: string;
    unit: ProductUnit;
    qty: number;
    subtotal: number;
    stock_qty: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: any, unit: ProductUnit, stock_qty: number) => void;
    updateQty: (cart_id: string, qty: number) => void;
    updateUnit: (cart_id: string, unit: ProductUnit) => void;
    removeItem: (cart_id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (product, unit, stock_qty) => set((state) => {
        // try to find existing item with SAME product_id AND SAME unit_id
        const existingIndex = state.items.findIndex(
            (i) => i.product_id === product.id && i.unit.id === unit.id
        );
        if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].qty += 1;
            newItems[existingIndex].subtotal = newItems[existingIndex].qty * unit.price_sell;
            return { items: newItems };
        }
        const newItem: CartItem = {
            cart_id: crypto.randomUUID(),
            product_id: product.id,
            product_name: product.name,
            unit,
            qty: 1,
            subtotal: unit.price_sell,
            stock_qty,
        };
        return { items: [...state.items, newItem] };
    }),
    updateQty: (cart_id, qty) => set((state) => ({
        items: state.items.map(i => i.cart_id === cart_id ? { ...i, qty, subtotal: qty * i.unit.price_sell } : i)
    })),
    updateUnit: (cart_id, unit) => set((state) => ({
        items: state.items.map(i => i.cart_id === cart_id ? { ...i, unit, subtotal: i.qty * unit.price_sell } : i)
    })),
    removeItem: (cart_id) => set((state) => ({
        items: state.items.filter(i => i.cart_id !== cart_id)
    })),
    clearCart: () => set({ items: [] }),
    getTotal: () => get().items.reduce((acc, item) => acc + item.subtotal, 0),
}));
