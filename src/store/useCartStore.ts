import { create } from 'zustand';

export interface ProductUnit {
    id: string;
    unit_type: string;
    price_sell: number;
    price_cost: number;
    qty_per_base_unit: number;
}

export interface CartItemDiscount {
    type: 'percent' | 'fixed';
    value: number;
    reason?: string;
}

export interface CartItem {
    cart_id: string; // unique for list
    product_id: string;
    product_name: string;
    unit: ProductUnit;
    qty: number;
    subtotal: number;
    stock_qty: number;
    discount?: CartItemDiscount;
}

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    isMember?: boolean;
}

export interface AdditionalFee {
    name: string;
    amount: number;
}

export interface HeldCart {
    id: string;
    items: CartItem[];
    timestamp: number;
    customer?: Customer | null;
    additionalFee?: AdditionalFee | null;
    notes?: string;
}

interface CartStore {
    items: CartItem[];
    additionalFee: AdditionalFee | null;
    notes: string;
    customer: Customer | null;
    heldCarts: HeldCart[];
    addItem: (product: any, unit: ProductUnit, stock_qty: number) => void;
    updateQty: (cart_id: string, qty: number) => void;
    updateUnit: (cart_id: string, unit: ProductUnit) => void;
    removeItem: (cart_id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getSubtotal: () => number;
    getTotalDiscount: () => number;
    setDiscount: (cart_id: string, discount: CartItemDiscount | undefined) => void;
    setAdditionalFee: (fee: AdditionalFee | null) => void;
    setNotes: (notes: string) => void;
    setCustomer: (customer: Customer | null) => void;
    holdCart: () => string;
    restoreCart: (heldCartId: string) => void;
    deleteHeldCart: (heldCartId: string) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    additionalFee: null,
    notes: '',
    customer: null,
    heldCarts: [],
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
    clearCart: () => set({ items: [], additionalFee: null, notes: '', customer: null }),
    getSubtotal: () => get().items.reduce((acc, item) => acc + (item.qty * item.unit.price_sell), 0),
    getTotalDiscount: () => get().items.reduce((acc, item) => {
        if (!item.discount) return acc;
        const itemSubtotal = item.qty * item.unit.price_sell;
        if (item.discount.type === 'percent') {
            return acc + (itemSubtotal * item.discount.value / 100);
        } else {
            return acc + item.discount.value;
        }
    }, 0),
    getTotal: () => {
        const subtotal = get().items.reduce((acc, item) => {
            let itemTotal = item.qty * item.unit.price_sell;
            if (item.discount) {
                if (item.discount.type === 'percent') {
                    itemTotal = itemTotal * (1 - item.discount.value / 100);
                } else {
                    itemTotal = itemTotal - item.discount.value;
                }
            }
            return acc + Math.max(0, itemTotal);
        }, 0);
        const fee = get().additionalFee?.amount || 0;
        return subtotal + fee;
    },
    setDiscount: (cart_id, discount) => set((state) => ({
        items: state.items.map(i => {
            if (i.cart_id === cart_id) {
                const newItem = { ...i, discount };
                // Recalculate subtotal with discount
                const baseSubtotal = i.qty * i.unit.price_sell;
                if (discount) {
                    if (discount.type === 'percent') {
                        newItem.subtotal = baseSubtotal * (1 - discount.value / 100);
                    } else {
                        newItem.subtotal = Math.max(0, baseSubtotal - discount.value);
                    }
                } else {
                    newItem.subtotal = baseSubtotal;
                }
                return newItem;
            }
            return i;
        })
    })),
    setAdditionalFee: (fee) => set({ additionalFee: fee }),
    setNotes: (notes) => set({ notes }),
    setCustomer: (customer) => set({ customer }),
    holdCart: () => {
        const state = get();
        if (state.items.length === 0) return '';
        const heldCart: HeldCart = {
            id: crypto.randomUUID(),
            items: [...state.items],
            timestamp: Date.now(),
            customer: state.customer,
            additionalFee: state.additionalFee,
            notes: state.notes,
        };
        set({ heldCarts: [...state.heldCarts, heldCart], items: [], additionalFee: null, notes: '', customer: null });
        return heldCart.id;
    },
    restoreCart: (heldCartId) => set((state) => {
        const heldCart = state.heldCarts.find(c => c.id === heldCartId);
        if (!heldCart) return state;
        return {
            items: heldCart.items,
            customer: heldCart.customer || null,
            additionalFee: heldCart.additionalFee || null,
            notes: heldCart.notes || '',
            heldCarts: state.heldCarts.filter(c => c.id !== heldCartId),
        };
    }),
    deleteHeldCart: (heldCartId) => set((state) => ({
        heldCarts: state.heldCarts.filter(c => c.id !== heldCartId),
    })),
}));
