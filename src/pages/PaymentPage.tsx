import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Smartphone, Users, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../utils/format';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ReceiptView from '../components/pos/ReceiptView';

type PaymentTab = 'CASH' | 'NON_CASH' | 'KREDIT';

const generatePresets = (total: number) => {
    const base = [5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const valid = base.filter((amt) => amt >= total);
    return [total, ...valid.slice(0, 4)];
};

// Mock customers for credit
const MOCK_CUSTOMERS = [
    { id: '1', name: 'Bu Siti', phone: '08123456789' },
    { id: '2', name: 'Pak Budi', phone: '08198765432' },
    { id: '3', name: 'Ibu Ani', phone: '08234567890' },
];

export default function PaymentPage() {
    const navigate = useNavigate();
    const {
        items,
        getTotal,
        clearCart,
        additionalFee,
        notes,
        customer,
        getSubtotal,
        getTotalDiscount,
    } = useCartStore();

    const [tab, setTab] = useState<PaymentTab>('CASH');
    const [paidAmount, setPaidAmount] = useState<number>(getTotal());
    const [customInput, setCustomInput] = useState<string>(getTotal().toString());
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedNonCashMethod, setSelectedNonCashMethod] = useState('QRIS');
    const [completedTransaction, setCompletedTransaction] = useState<any>(null);
    const [showConfirmExit, setShowConfirmExit] = useState(false);

    const presets = generatePresets(getTotal());

    const handleExit = () => {
        if (completedTransaction) {
            clearCart();
            navigate('/transactions/new');
        } else if (items.length > 0) {
            setShowConfirmExit(true);
        } else {
            navigate('/transactions/new');
        }
    };

    const handleConfirmExit = () => {
        setShowConfirmExit(false);
        navigate('/transactions/new');
    };

    const handlePresetClick = (amt: number) => {
        setPaidAmount(amt);
        setCustomInput(amt.toString());
    };

    const handleNumpad = (val: string) => {
        if (val === 'backspace') {
            setCustomInput((prev) => prev.slice(0, -1));
            setPaidAmount(Number(customInput.slice(0, -1)) || 0);
        } else if (['5000', '10000', '50000'].includes(val)) {
            const newVal = (Number(customInput) || 0) + Number(val);
            setCustomInput(newVal.toString());
            setPaidAmount(newVal);
        } else {
            const newVal = customInput + val;
            setCustomInput(newVal);
            setPaidAmount(Number(newVal));
        }
    };

    const handleSubmit = () => {
        let customerName = '';
        if (tab === 'KREDIT') {
            customerName = MOCK_CUSTOMERS.find((c) => c.id === selectedCustomerId)?.name || '';
            if (!selectedCustomerId) {
                alert('Pilih customer untuk transaksi kredit!');
                return;
            }
        }

        // Create transaction record
        const transaction = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            subtotal: getSubtotal(),
            discount: getTotalDiscount(),
            fee: additionalFee?.amount || 0,
            total: getTotal(),
            payment_method: tab,
            paid_amount: paidAmount,
            change: tab === 'CASH' ? Math.max(0, paidAmount - getTotal()) : 0,
            customer_id: tab === 'KREDIT' ? selectedCustomerId : customer?.id,
            customer_name: tab === 'KREDIT' ? customerName : customer?.name,
            customer_phone: tab === 'KREDIT'
                ? MOCK_CUSTOMERS.find((c) => c.id === selectedCustomerId)?.phone
                : customer?.phone,
            notes,
            items: items.map((i) => ({
                product_id: i.product_id,
                product_name: i.product_name,
                qty: i.qty,
                unit: i.unit,
                unit_price: i.unit.price_sell,
                discount: i.discount,
                subtotal: i.subtotal,
            })),
            additional_fee: additionalFee,
        };

        setCompletedTransaction(transaction);
    };

    // Show receipt if transaction completed
    if (completedTransaction) {
        return (
            <ReceiptView
                transaction={completedTransaction}
                onNewTransaction={() => {
                    clearCart();
                    navigate('/transactions/new');
                }}
                onBack={() => setCompletedTransaction(null)}
            />
        );
    }

    const total = getTotal();
    const subtotal = getSubtotal();
    const totalDiscount = getTotalDiscount();
    const feeAmount = additionalFee?.amount || 0;

    return (
        <>
            <div className="min-h-screen bg-[#020617] flex flex-col pb-32">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExit}
                            className="p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-lg font-black text-white">Pembayaran</h1>
                    </div>
                </div>

                {/* Payment Method Tabs */}
                <div className="flex shadow-lg bg-[#0f172a] border-b border-slate-800">
                    <button
                        onClick={() => {
                            setTab('CASH');
                            setPaidAmount(total);
                            setCustomInput(total.toString());
                        }}
                        className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            tab === 'CASH'
                                ? 'text-green-400 border-b-2 border-green-400 bg-green-500/5'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Wallet size={18} />
                        Tunai
                    </button>
                    <button
                        onClick={() => {
                            setTab('NON_CASH');
                            setPaidAmount(total);
                            setCustomInput(total.toString());
                        }}
                        className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            tab === 'NON_CASH'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Smartphone size={18} />
                        Non-Tunai
                    </button>
                    <button
                        onClick={() => {
                            setTab('KREDIT');
                            setPaidAmount(0);
                            setCustomInput('0');
                        }}
                        className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            tab === 'KREDIT'
                                ? 'text-red-400 border-b-2 border-red-400 bg-red-500/5'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Users size={18} />
                        Piutang
                    </button>
                </div>

                {/* Total Display */}
                <div className="p-6">
                    <div className="bg-[#0f172a] rounded-3xl p-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
                        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">
                            Total Tagihan
                        </div>
                        <div className="text-5xl font-black text-white">{formatCurrency(total)}</div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <div className="text-8xl font-black">POS</div>
                        </div>
                    </div>
                </div>

                {/* Fee & Discount Summary */}
                {(totalDiscount > 0 || feeAmount > 0 || customer) && (
                    <div className="px-6 mb-6">
                        <div className="bg-slate-800/30 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Subtotal</span>
                                <span className="text-white">{formatCurrency(subtotal)}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-400">Diskon</span>
                                    <span className="text-orange-400">
                                        -{formatCurrency(totalDiscount)}
                                    </span>
                                </div>
                            )}
                            {feeAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-400">{additionalFee?.name}</span>
                                    <span className="text-blue-400">
                                        +{formatCurrency(feeAmount)}
                                    </span>
                                </div>
                            )}
                            {customer && (
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                                    <span className="text-slate-400">Pelanggan</span>
                                    <span className="text-white">{customer.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Details */}
                <div className="flex-1 overflow-y-auto px-6">
                    {tab === 'CASH' && (
                        <div className="space-y-6">
                            {/* Preset Amounts */}
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                                    Uang Cepat
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {presets.map((amt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handlePresetClick(amt)}
                                            className={`py-4 rounded-2xl font-black text-lg border-2 transition-all active:scale-95 ${
                                                paidAmount === amt
                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                                    : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-600'
                                            }`}
                                        >
                                            {amt === total ? 'Uang Pas' : formatCurrency(amt).replace('Rp', '').trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Numpad */}
                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                                    Input Manual
                                </div>
                                <div className="text-right text-4xl font-black mb-6 text-green-400 tracking-tighter">
                                    {customInput ? formatCurrency(Number(customInput)) : 'Rp 0'}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'backspace'].map(
                                        (val) => (
                                            <button
                                                key={val}
                                                onClick={() => handleNumpad(val)}
                                                className="py-5 bg-slate-800 rounded-2xl text-2xl font-black hover:bg-slate-700 active:bg-slate-900 transition-colors shadow-sm"
                                            >
                                                {val === 'backspace' ? '⌫' : val}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Change Display */}
                            {paidAmount > total && (
                                <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20 flex justify-between items-center text-green-400 font-black">
                                    <span className="uppercase tracking-widest text-xs">Kembalian</span>
                                    <span className="text-3xl tracking-tighter">
                                        {formatCurrency(paidAmount - total)}
                                    </span>
                                </div>
                            )}
                            {paidAmount < total && customInput && (
                                <div className="text-red-400 text-center font-black animate-pulse">
                                    Kurang {formatCurrency(total - paidAmount)}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'NON_CASH' && (
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                                    Metode Pembayaran
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'QRIS', label: 'QRIS', icon: '📱' },
                                        { id: 'TRANSFER', label: 'Transfer', icon: '🏦' },
                                        { id: 'EWALLET', label: 'E-Wallet', icon: '💳' },
                                        { id: 'DEBIT', label: 'Kartu Debit', icon: '💳' },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedNonCashMethod(method.id)}
                                            className={`p-6 rounded-2xl font-bold text-lg border-2 transition-all ${
                                                selectedNonCashMethod === method.id
                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="text-3xl mb-2">{method.icon}</div>
                                            <div>{method.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reference Number */}
                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                                    Nomor Referensi (Opsional)
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan nomor referensi..."
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    )}

                    {tab === 'KREDIT' && (
                        <div className="space-y-6">
                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                                    Pilih Pelanggan
                                </label>
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl font-black text-lg outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">-- Pilih Customer --</option>
                                    {MOCK_CUSTOMERS.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#0f172a]">
                                            {c.name} - {c.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                                    Bayar Sebagian (DP)
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-black text-slate-500">Rp</span>
                                    <input
                                        type="number"
                                        value={paidAmount || ''}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(total, Number(e.target.value)));
                                            setPaidAmount(val);
                                            setCustomInput(val.toString());
                                        }}
                                        placeholder="0"
                                        className="flex-1 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-2xl outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="mt-6 flex justify-between text-slate-400 font-black">
                                    <span className="uppercase tracking-widest text-xs">Sisa Piutang:</span>
                                    <span className="text-red-400 text-xl">{formatCurrency(total - paidAmount)}</span>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                                    <Clock size={16} className="inline mr-1" />
                                    Jatuh Tempo
                                </label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a] border-t border-slate-800 z-30">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={handleSubmit}
                            disabled={
                                (tab === 'CASH' && paidAmount < total) ||
                                (tab === 'KREDIT' && !selectedCustomerId)
                            }
                            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                        >
                            {tab === 'CASH' && 'Proses Pembayaran'}
                            {tab === 'NON_CASH' && 'Proses Pembayaran'}
                            {tab === 'KREDIT' && 'Simpan Piutang'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Exit Dialog */}
            <ConfirmDialog
                isOpen={showConfirmExit}
                onClose={() => setShowConfirmExit(false)}
                onConfirm={handleConfirmExit}
                title="Batalkan Pembayaran?"
                message="Anda akan kembali ke halaman transaksi. Keranjang masih tersimpan."
                confirmText="Ya, Kembali"
                cancelText="Batal"
                variant="warning"
            />
        </>
    );
}
