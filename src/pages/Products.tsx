import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import ProductModal from '../components/products/ProductModal';
import StockAdjustmentModal from '../components/products/StockAdjustmentModal';

import type { Product } from '../types/product';
import { PRODUCT_CATEGORIES } from '../types/product';

const INITIAL_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Indomie Goreng',
        category: 'Sembako',
        barcode: '089686043130',
        stock_qty: 120,
        units: [
            { id: 'u1', unit_type: 'Pcs', price_sell: 3500, price_cost: 3000, qty_per_base_unit: 1, is_default: true },
            { id: 'u2', unit_type: 'Dus', price_sell: 135000, price_cost: 120000, qty_per_base_unit: 40, is_default: false },
        ]
    },
    {
        id: '2',
        name: 'Teh Pucuk Harum 350ml',
        category: 'Minuman',
        barcode: '8996001416187',
        stock_qty: 8,
        units: [
            { id: 'u3', unit_type: 'Botol', price_sell: 4000, price_cost: 3200, qty_per_base_unit: 1, is_default: true },
        ]
    }
];

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleSaveProduct = (productData: Product) => {
        if (selectedProduct) {
            setProducts(products.map(p => p.id === productData.id ? productData : p));
        } else {
            setProducts([...products, productData]);
        }
    };

    const handleUpdateStock = (id: string, newQty: number) => {
        setProducts(products.map(p => p.id === id ? { ...p, stock_qty: newQty } : p));
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleOpenEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleOpenStock = (product: Product) => {
        setSelectedProduct(product);
        setIsStockModalOpen(true);
    };

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-white">Daftar Produk</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama atau barcode..."
                        className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm text-white placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto pb-1 no-scrollbar">

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-slate-300 outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
                    >
                        <option value="ALL">Semua Kategori</option>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-white">{product.name}</h3>
                                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{product.category}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${product.stock_qty < 10 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                product.stock_qty < 50 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                }`}>
                                {product.stock_qty < 10 && <AlertCircle size={14} />}
                                Stok: {product.stock_qty}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {product.units.map(unit => (
                                <div key={unit.id} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-lg border border-slate-800">
                                    <span className="font-medium text-slate-300">{unit.unit_type} {unit.is_default && <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded ml-1">Default</span>}</span>
                                    <div className="text-right">
                                        <div className="font-bold text-white">{formatCurrency(unit.price_sell)}</div>
                                        <div className="text-[10px] text-slate-500">Modal: {formatCurrency(unit.price_cost)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800">
                            <button
                                onClick={() => handleOpenEdit(product)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                onClick={() => handleOpenStock(product)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg border border-primary/20 transition-colors"
                            >
                                <Package size={16} /> Stok
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleOpenAdd}
                className="fixed bottom-24 right-4 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 shadow-primary/40"
            >
                <Plus size={36} />
            </button>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleSaveProduct}
                initialData={selectedProduct}
            />

            <StockAdjustmentModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onSave={handleUpdateStock}
                product={selectedProduct}
            />
        </div>
    );
}
