import { useState } from 'react';
import { X, Package, Truck, CreditCard } from 'lucide-react';
import type { AdditionalFee } from '../../store/useCartStore';

interface FeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (fee: AdditionalFee) => void;
    currentFee?: AdditionalFee | null;
}

const PREDEFINED_FEES = [
    { name: 'Biaya Layanan', icon: Package, amount: 5000 },
    { name: 'Biaya Kemasan', icon: Package, amount: 2000 },
    { name: 'Biaya Antar', icon: Truck, amount: 10000 },
    { name: 'Biaya Admin', icon: CreditCard, amount: 2500 },
];

export default function FeeModal({ isOpen, onClose, onApply, currentFee }: FeeModalProps) {
    const [name, setName] = useState(currentFee?.name || '');
    const [amount, setAmount] = useState(currentFee?.amount || 0);

    if (!isOpen) return null;

    const handleApply = () => {
        if (!name.trim() || amount <= 0) return;
        onApply({
            name: name.trim(),
            amount,
        });
        onClose();
    };

    const handlePredefinedClick = (feeName: string, feeAmount: number) => {
        setName(feeName);
        setAmount(feeAmount);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-t-3xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white">Biaya Tambahan</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Predefined Fees */}
                <div className="mb-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                        Pilih Cepat
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PREDEFINED_FEES.map((fee) => {
                            const Icon = fee.icon;
                            return (
                                <button
                                    key={fee.name}
                                    onClick={() => handlePredefinedClick(fee.name, fee.amount)}
                                    className={`p-4 rounded-xl text-left transition-all border ${
                                        name === fee.name && amount === fee.amount
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon size={16} />
                                        <span className="font-bold text-sm">{fee.name}</span>
                                    </div>
                                    <div className="font-black">{fee.amount.toLocaleString('id-ID')}</div>
                                </button>
                            );
                        })}
                        <button
                            onClick={() => { setName(''); setAmount(0); }}
                            className={`p-4 rounded-xl text-left transition-all border ${
                                !name && amount === 0
                                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <X size={16} />
                                <span className="font-bold text-sm">Hapus Biaya</span>
                            </div>
                            <div className="font-black">-</div>
                        </button>
                    </div>
                </div>

                {/* Custom Fee */}
                <div className="mb-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                        Kustom
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama biaya (contoh: Biaya Lainnya)"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-600"
                        />
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-500">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                placeholder="0"
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-black text-xl text-white placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {name && amount > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                                Biaya Tambahan
                            </span>
                            <span className="text-blue-400 font-black text-xl">
                                +{amount.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="text-slate-400 text-sm mt-1">{name}</div>
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
                        disabled={!name.trim() || amount <= 0}
                        className="flex-1 py-4 rounded-xl font-black text-white bg-primary shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98]"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}
