import { useState } from 'react';
import { formatCurrency } from '../../utils/format';

interface CheckoutFlowProps {
    total: number;
    onComplete: (paymentMethod: string, paidAmount: number, customerId?: string, customerName?: string) => void;
}

const generatePresets = (total: number) => {
    const base = [5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const valid = base.filter(amt => amt >= total);
    return [total, ...valid.slice(0, 4)];
};

export default function CheckoutFlow({ total, onComplete }: CheckoutFlowProps) {
    const [tab, setTab] = useState<'CASH' | 'NON_CASH' | 'KREDIT'>('CASH');
    const [paidAmount, setPaidAmount] = useState<number>(total);
    const presets = generatePresets(total);
    const [customInput, setCustomInput] = useState<string>('');

    // Dummy customers for selection
    const customers = [
        { id: '1', name: 'Bu Siti' },
        { id: '2', name: 'Pak Budi' }
    ];
    const [selectedCustomerId, setSelectedCustomerId] = useState('');

    const handlePresetClick = (amt: number) => {
        setPaidAmount(amt);
        setCustomInput(amt.toString());
    };

    const handleNumpad = (val: string) => {
        if (val === 'backspace') {
            setCustomInput(prev => prev.slice(0, -1));
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
            customerName = customers.find(c => c.id === selectedCustomerId)?.name || '';
            if (!selectedCustomerId) {
                alert('Pilih customer untuk transaksi kredit!');
                return;
            }
        }

        onComplete(tab, paidAmount, tab === 'KREDIT' ? selectedCustomerId : undefined, customerName);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#020617] text-white">
            <div className="flex shadow-lg bg-[#0f172a] border-b border-slate-800">
                <button onClick={() => { setTab('CASH'); setPaidAmount(total); }} className={`flex-1 py-5 font-black text-sm uppercase tracking-wider transition-all ${tab === 'CASH' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}>Tunai</button>
                <button onClick={() => { setTab('NON_CASH'); setPaidAmount(total); }} className={`flex-1 py-5 font-black text-sm uppercase tracking-wider transition-all ${tab === 'NON_CASH' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}>Non-Tunai</button>
                <button onClick={() => { setTab('KREDIT'); setPaidAmount(0); }} className={`flex-1 py-5 font-black text-sm uppercase tracking-wider transition-all ${tab === 'KREDIT' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}>Piutang</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-[#0f172a] rounded-3xl p-8 shadow-xl border border-slate-800 text-center relative overflow-hidden">
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Total Tagihan</div>
                    <div className="text-5xl font-black text-white">{formatCurrency(total)}</div>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <div className="text-8xl font-black">POS</div>
                    </div>
                </div>

                {tab === 'CASH' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            {presets.map((amt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePresetClick(amt)}
                                    className={`py-4 rounded-2xl font-black text-lg border-2 transition-all active:scale-95 ${paidAmount === amt ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-600'}`}
                                >
                                    {amt === total ? 'Uang Pas' : formatCurrency(amt).replace('Rp', '').trim()}
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                            <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4">Input Manual / Numpad</div>
                            <div className="text-right text-4xl font-black mb-6 text-primary tracking-tighter">
                                {customInput ? formatCurrency(Number(customInput)) : "Rp 0"}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'backspace'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleNumpad(val)}
                                        className="py-5 bg-slate-800 rounded-2xl text-2xl font-black hover:bg-slate-700 active:bg-slate-900 transition-colors shadow-sm"
                                    >
                                        {val === 'backspace' ? '⌫' : val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paidAmount > total && (
                            <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20 flex justify-between items-center text-green-400 font-black">
                                <span className="uppercase tracking-widest text-xs">Kembalian</span>
                                <span className="text-3xl tracking-tighter">{formatCurrency(paidAmount - total)}</span>
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
                    <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                        <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4">Metode Pembayaran</div>
                        <select className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl font-black text-lg outline-none ring-primary focus:ring-2 appearance-none">
                            <option value="QRIS">QRIS</option>
                            <option value="TRANSFER">Transfer Bank</option>
                            <option value="EWALLET">E-Wallet</option>
                        </select>
                    </div>
                )}

                {tab === 'KREDIT' && (
                    <div className="space-y-6">
                        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Pilih Pelanggan</label>
                            <select
                                value={selectedCustomerId}
                                onChange={e => setSelectedCustomerId(e.target.value)}
                                className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl font-black text-lg outline-none appearance-none"
                            >
                                <option value="">-- Pilih Customer --</option>
                                {customers.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>)}
                            </select>
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Bayar Sebagian (DP)</label>
                            <input
                                type="number"
                                value={paidAmount || ''}
                                onChange={e => setPaidAmount(Number(e.target.value))}
                                placeholder="0"
                                className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl font-black text-2xl outline-none ring-primary focus:ring-2 placeholder:text-slate-600"
                            />
                            <div className="mt-6 flex justify-between text-slate-400 font-black">
                                <span className="uppercase tracking-widest text-xs">Sisa Piutang:</span>
                                <span className="text-red-400 text-xl">{formatCurrency(total - paidAmount)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-[#0f172a] border-t border-slate-800">
                <button
                    onClick={handleSubmit}
                    disabled={(tab === 'CASH' && paidAmount < total) || (tab === 'KREDIT' && !selectedCustomerId)}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                >
                    Selesaikan Transaksi
                </button>
            </div>
        </div>
    );
}
