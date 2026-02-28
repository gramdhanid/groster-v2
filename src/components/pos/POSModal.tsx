import { useState, useEffect } from 'react';
import { X, Search, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCartStore } from '../../store/useCartStore';
import CheckoutFlow from './CheckoutFlow';
import ReceiptPreview from './ReceiptPreview';

interface POSModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Dummy products for now (should fetch from Dexie/Supabase)
const MOCK_PRODUCTS = [
    {
        id: '1', name: 'Indomie Goreng', category: 'Mie & Snack', barcode: '089686043130', stock_qty: 120, units: [
            { id: 'u1', unit_type: 'Pcs', price_sell: 3500, price_cost: 3000, qty_per_base_unit: 1 },
            { id: 'u2', unit_type: 'Dus', price_sell: 135000, price_cost: 120000, qty_per_base_unit: 40 },
        ]
    },
    {
        id: '2', name: 'Teh Pucuk Harum 350ml', category: 'Minuman', barcode: '8996001416187', stock_qty: 48, units: [
            { id: 'u3', unit_type: 'Botol', price_sell: 4000, price_cost: 3200, qty_per_base_unit: 1 },
        ]
    },
    {
        id: '3', name: 'Beras Raja Lele 5kg', category: 'Sembako', barcode: '123456789', stock_qty: 10, units: [
            { id: 'u4', unit_type: 'Karung', price_sell: 75000, price_cost: 68000, qty_per_base_unit: 1 },
        ]
    },
    {
        id: '4', name: 'Gudang Garam Filter 12', category: 'Rokok & Tembakau', barcode: '8999999000123', stock_qty: 24, units: [
            { id: 'u5', unit_type: 'Bungkus', price_sell: 25000, price_cost: 23500, qty_per_base_unit: 1 },
        ]
    },
];

const TOP_CATEGORIES = ['Semua', 'Rokok & Tembakau', 'Minuman', 'Mie & Snack'];

type Step = 'CART' | 'CHECKOUT' | 'RECEIPT';

export default function POSModal({ isOpen, onClose }: POSModalProps) {
    const { items, addItem, updateQty, updateUnit, removeItem, clearCart, getTotal } = useCartStore();

    const [step, setStep] = useState<Step>('CART');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchResults, setSearchResults] = useState<typeof MOCK_PRODUCTS>([]);
    const [lastTransaction, setLastTransaction] = useState<any>(null);

    useEffect(() => {
        const q = search.toLowerCase();
        let filtered = MOCK_PRODUCTS;

        if (q.length > 1) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) || p.barcode === q
            );
        }

        if (selectedCategory !== 'Semua') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        setSearchResults(filtered.slice(0, 10));
    }, [search, selectedCategory]);

    const handleClose = () => {
        if (items.length > 0 && step !== 'RECEIPT') {
            if (confirm('Keranjang belum kosong. Yakin ingin menutup?')) {
                clearCart();
                setStep('CART');
                onClose();
            }
        } else {
            clearCart();
            setStep('CART');
            onClose();
        }
    };

    const handleCheckoutComplete = (paymentMethod: string, paidAmount: number, customerId?: string, customerName?: string) => {
        const tx = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            total: getTotal(),
            payment_method: paymentMethod,
            paid_amount: paidAmount,
            customer_id: customerId,
            customer_name: customerName,
            items: items.map(i => ({
                product_id: i.product_id,
                product_name: i.product_name,
                qty: i.qty,
                unit: i.unit,
                unit_price: i.unit.price_sell,
                subtotal: i.subtotal,
            }))
        };

        // In real scenario: save to Dexie and queue sync
        setLastTransaction(tx);
        setStep('RECEIPT');
    };

    const handleDone = () => {
        clearCart();
        setStep('CART');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity">
            <div
                className={`bg-[#0f172a] h-[95vh] rounded-t-3xl shadow-2xl flex flex-col transform transition-transform duration-300 translate-y-0 text-white`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-black tracking-tight">
                        {step === 'CART' ? 'Transaksi Baru' : step === 'CHECKOUT' ? 'Pembayaran' : 'Selesai'}
                    </h2>
                    {step !== 'RECEIPT' && (
                        <button
                            onClick={handleClose}
                            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {step === 'CART' && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#020617]">
                        <div className="p-4 bg-[#0f172a] border-b border-slate-800 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Cari produk atau scan barcode..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                                {TOP_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                            }`}
                                    >
                                        {cat.split(' & ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Results Dropdown (only when typing) */}
                        {searchResults.length > 0 && search.length > 1 && (
                            <div className="absolute left-4 right-4 top-48 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
                                {searchResults.map(p => (
                                    <div key={p.id} className="p-4 border-b border-slate-700 last:border-0 flex justify-between items-center hover:bg-slate-800 active:bg-slate-900 transition-colors">
                                        <div>
                                            <div className="font-bold text-slate-100">{p.name}</div>
                                            <div className="text-sm text-slate-400">Stok: {p.stock_qty} • {formatCurrency(p.units[0].price_sell)}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addItem(p, p.units[0], p.stock_qty);
                                                setSearch('');
                                            }}
                                            className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg font-bold"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Category Quick Selector (when no search active) */}
                        {search.length <= 1 && (
                            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[35vh] shrink-0 border-b border-slate-800 bg-[#0f172a]/30">
                                {searchResults.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => addItem(p, p.units[0], p.stock_qty)}
                                        className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl text-left hover:border-primary/50 active:scale-95 transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="font-bold text-[10px] text-slate-200 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{p.name}</div>
                                        <div className="text-xs text-primary font-black mt-1">{formatCurrency(p.units[0].price_sell)}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                    <Search size={48} className="mb-4 opacity-10" />
                                    <p>Cari produk untuk ditambahkan ke keranjang</p>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.cart_id} className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-slate-100 pr-4">{item.product_name}</div>
                                            <button onClick={() => removeItem(item.cart_id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-primary font-black">{formatCurrency(item.subtotal)}</div>
                                            <select
                                                value={item.unit.id}
                                                onChange={(e) => {
                                                    const product = MOCK_PRODUCTS.find(p => p.id === item.product_id);
                                                    const newUnit = product?.units.find(u => u.id === e.target.value);
                                                    if (newUnit) updateUnit(item.cart_id, newUnit);
                                                }}
                                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm outline-none font-semibold text-slate-200"
                                            >
                                                {MOCK_PRODUCTS.find(p => p.id === item.product_id)?.units.map(u => (
                                                    <option key={u.id} value={u.id} className="bg-[#0f172a]">{u.unit_type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex gap-2">
                                                <button onClick={() => updateQty(item.cart_id, 1)} className="px-3 py-1 bg-slate-800 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-colors">1</button>
                                                <button onClick={() => updateQty(item.cart_id, 5)} className="px-3 py-1 bg-slate-800 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-colors">5</button>
                                                <button onClick={() => updateQty(item.cart_id, 10)} className="px-3 py-1 bg-slate-800 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-colors">10</button>
                                            </div>

                                            <div className="flex items-center border border-slate-700 rounded-lg bg-slate-800/30">
                                                <button
                                                    onClick={() => updateQty(item.cart_id, Math.max(1, item.qty - 1))}
                                                    className="p-2 text-slate-400 hover:text-white"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <div className="w-12 text-center font-bold text-lg text-white">{item.qty}</div>
                                                <button
                                                    onClick={() => updateQty(item.cart_id, item.qty + 1)}
                                                    className="p-2 text-primary hover:text-primary-foreground"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Checkout Area */}
                        <div className="p-6 bg-[#0f172a] border-t border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-500 font-medium text-lg">Subtotal</span>
                                <span className="text-3xl font-black text-white">{formatCurrency(getTotal())}</span>
                            </div>
                            <button
                                disabled={items.length === 0}
                                onClick={() => setStep('CHECKOUT')}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl disabled:opacity-30 disabled:grayscale flex justify-between items-center px-8 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                <span>Bayar Sekarang</span>
                                <span>{items.length} item</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'CHECKOUT' && (
                    <CheckoutFlow
                        total={getTotal()}
                        onComplete={handleCheckoutComplete}
                    />
                )}

                {step === 'RECEIPT' && lastTransaction && (
                    <ReceiptPreview
                        transaction={lastTransaction}
                        onCorrect={() => setStep('CHECKOUT')}
                        onDone={handleDone}
                    />
                )}

            </div>
        </div>
    );
}
