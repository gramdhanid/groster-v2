import { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';
import type { CartItemDiscount } from '../../store/useCartStore';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (discount: CartItemDiscount) => void;
    currentDiscount?: CartItemDiscount;
    itemName: string;
    itemSubtotal: number;
}

const PERCENT_OPTIONS = [5, 10, 15, 20];

export default function DiscountModal({
    isOpen,
    onClose,
    onApply,
    currentDiscount,
    itemName,
    itemSubtotal,
}: DiscountModalProps) {
    const [type, setType] = useState<'percent' | 'fixed'>(currentDiscount?.type || 'percent');
    const [value, setValue] = useState(currentDiscount?.value || 0);
    const [reason, setReason] = useState(currentDiscount?.reason || '');

    if (!isOpen) return null;

    const handleApply = () => {
        if (value <= 0) return;
        onApply({
            type,
            value,
            reason: reason.trim() || undefined,
        });
        onClose();
    };

    const handlePercentClick = (percent: number) => {
        setType('percent');
        setValue(percent);
    };

    const maxDiscount = type === 'fixed' ? itemSubtotal : 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-t-3xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white">Diskon Item</h3>
                        <p className="text-sm text-slate-400 mt-1">{itemName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Item Subtotal Display */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Subtotal Item</div>
                    <div className="text-2xl font-black text-white mt-1">{itemSubtotal.toLocaleString('id-ID')}</div>
                </div>

                {/* Discount Type Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setType('percent'); setValue(0); }}
                        className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            type === 'percent'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                    >
                        <Percent size={18} />
                        Persen
                    </button>
                    <button
                        onClick={() => { setType('fixed'); setValue(0); }}
                        className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            type === 'fixed'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                    >
                        <DollarSign size={18} />
                        Nominal
                    </button>
                </div>

                {/* Percentage Options */}
                {type === 'percent' && (
                    <div className="mb-6">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                            Pilih Persentase
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {PERCENT_OPTIONS.map((percent) => (
                                <button
                                    key={percent}
                                    onClick={() => handlePercentClick(percent)}
                                    className={`py-4 rounded-xl font-black text-lg transition-all ${
                                        value === percent && type === 'percent'
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    {percent}%
                                </button>
                            ))}
                            <button
                                onClick={() => setValue(0)}
                                className={`py-4 rounded-xl font-bold text-sm transition-all ${
                                    value === 0
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                )}

                {/* Custom Value Input */}
                <div className="mb-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                        {type === 'percent' ? 'Persentase Kustom' : 'Nominal Diskon'}
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">
                            {type === 'percent' ? '%' : 'Rp'}
                        </span>
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => setValue(Math.min(maxDiscount, Math.max(0, Number(e.target.value))))}
                            placeholder="0"
                            className="w-full pl-14 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-black text-2xl text-white placeholder:text-slate-600"
                        />
                    </div>
                    {type === 'fixed' && (
                        <div className="text-xs text-slate-500 mt-2">
                            Maksimal: {itemSubtotal.toLocaleString('id-ID')}
                        </div>
                    )}
                </div>

                {/* Reason Input */}
                <div className="mb-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                        Alasan (Opsional)
                    </div>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Contoh: Barang rusak, member, dll."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-600"
                    />
                </div>

                {/* Preview */}
                {value > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-green-400 font-bold uppercase tracking-widest text-xs">
                                Diskon
                            </span>
                            <span className="text-green-400 font-black text-xl">
                                {type === 'percent'
                                    ? `${value}% (-${Math.round(itemSubtotal * value / 100).toLocaleString('id-ID')})`
                                    : `(-${value.toLocaleString('id-ID')})`
                                }
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-slate-800 border border-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={value <= 0}
                        className="flex-1 py-4 rounded-xl font-black text-white bg-primary shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98]"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}
