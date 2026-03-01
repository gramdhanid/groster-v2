import { useState, useEffect } from 'react';
import { X, Package, Plus, Minus, CheckCircle, AlertCircle, Layers } from 'lucide-react';

interface ProductUnit {
    id: string;
    unit_type: string;
    qty_per_base_unit: number;
}

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, newQty: number) => void;
    product: {
        id: string;
        name: string;
        stock_qty: number;
        units: ProductUnit[];
    } | null;
}

export default function StockAdjustmentModal({ isOpen, onClose, onSave, product }: StockAdjustmentModalProps) {
    const [adjustment, setAdjustment] = useState<number>(0);
    const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
    const [reason, setReason] = useState('Stok Masuk');
    const [finalStock, setFinalStock] = useState(0);

    useEffect(() => {
        if (product && product.units.length > 0) {
            setFinalStock(product.stock_qty);
            setAdjustment(0);
            setSelectedUnit(product.units[0]); // Default to first unit (usually base)
        }
    }, [product, isOpen]);

    useEffect(() => {
        if (product && selectedUnit) {
            const totalAdjustment = adjustment * selectedUnit.qty_per_base_unit;
            setFinalStock(product.stock_qty + totalAdjustment);
        }
    }, [adjustment, selectedUnit, product]);

    if (!isOpen || !product) return null;

    const handleSave = () => {
        onSave(product.id, finalStock);
        onClose();
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('id-ID');
    };

    const totalImpact = selectedUnit ? adjustment * selectedUnit.qty_per_base_unit : 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <Package className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight">Update Stok</h2>
                            <p className="text-xs text-slate-400 font-bold truncate max-w-[200px]">{product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-[#020617] overflow-y-auto max-h-[70vh]">
                    {/* Visual Comparison */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 text-center p-3 bg-slate-900 rounded-2xl border border-slate-800">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stok Awal</div>
                            <div className="text-xl font-black">{formatNumber(product.stock_qty)}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            {totalImpact >= 0 ? <Plus className="text-green-400" size={16} /> : <Minus className="text-red-400" size={16} />}
                            <span className={`text-xs font-black ${totalImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(totalImpact)}
                            </span>
                        </div>
                        <div className="flex-1 text-center p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Stok Akhir</div>
                            <div className="text-xl font-black text-primary">{formatNumber(finalStock)}</div>
                        </div>
                    </div>

                    {/* Unit Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Layers size={14} /> Pilih Satuan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {product.units.map(unit => (
                                <button
                                    key={unit.id}
                                    onClick={() => setSelectedUnit(unit)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedUnit?.id === unit.id
                                        ? 'border-primary bg-primary/10 text-white'
                                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="font-bold text-sm">{unit.unit_type}</div>
                                    <div className="text-[10px] font-bold opacity-60">
                                        isi {unit.qty_per_base_unit} {product.units[0].unit_type}
                                    </div>
                                    {selectedUnit?.id === unit.id && (
                                        <div className="absolute top-1 right-2">
                                            <CheckCircle size={14} className="text-primary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Jumlah ({selectedUnit?.unit_type})
                            </label>
                            {/* <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAdjustment(prev => prev - 1)}
                                    className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-90 transition-transform"
                                >
                                    <Minus size={24} strokeWidth={3} />
                                </button>
                                <input
                                    type="number"
                                    value={adjustment === 0 ? '' : adjustment}
                                    onChange={(e) => setAdjustment(Number(e.target.value))}
                                    placeholder="0"
                                    className="flex-1 h-14 bg-slate-800/50 border border-slate-700 rounded-2xl text-center text-xl font-black outline-none focus:ring-2 focus:ring-primary shadow-inner"
                                />
                                <button
                                    onClick={() => setAdjustment(prev => prev + 1)}
                                    className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary active:scale-90 transition-transform"
                                >
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div> */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setAdjustment(prev => prev - 1)}
                                    className="h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-90 transition-transform"
                                >
                                    <Minus size={24} strokeWidth={3} />
                                </button>
                                <input
                                    type="number"
                                    value={adjustment === 0 ? '' : adjustment}
                                    onChange={(e) => setAdjustment(Number(e.target.value))}
                                    placeholder="0"
                                    className="h-14 bg-slate-800/50 border border-slate-700 rounded-2xl text-center text-xl font-black outline-none focus:ring-2 focus:ring-primary shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                    onClick={() => setAdjustment(prev => prev + 1)}
                                    className="h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary active:scale-90 transition-transform"
                                >
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Alasan Perubahan</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Stok Masuk', 'Stok Keluar', 'Penyesuaian', 'Rusak'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            setReason(r);
                                            if (r === 'Stok Keluar' || r === 'Rusak') {
                                                if (adjustment > 0) setAdjustment(prev => -prev);
                                            } else if (r === 'Stok Masuk') {
                                                if (adjustment < 0) setAdjustment(prev => Math.abs(prev));
                                            }
                                        }}
                                        className={`py-3 px-2 rounded-xl text-xs font-black transition-all border ${reason === r
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {finalStock < 0 && (
                        <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 italic text-[10px] font-bold">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Perhatian: Stok akan menjadi negatif ({finalStock}).</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-[#0f172a]">
                    <button
                        onClick={handleSave}
                        disabled={adjustment === 0}
                        className={`w-full py-2 rounded-2xl font-black text-lg flex flex-col items-center justify-center gap-0 transition-all ${adjustment === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            : 'bg-primary text-white shadow-xl shadow-primary/20 active:scale-[0.98]'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} /> Update Stok
                        </div>
                        {adjustment !== 0 && (
                            <span className="text-[15px] opacity-80 font-bold">
                                {adjustment > 0 ? 'Tambah' : 'Kurangi'} {Math.abs(totalImpact)} Pcs
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
