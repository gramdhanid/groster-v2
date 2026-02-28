import { formatCurrency } from '../../utils/format';
import { Printer, Edit2, CheckCircle } from 'lucide-react';

interface ReceiptPreviewProps {
    transaction: any;
    onCorrect: () => void;
    onDone: () => void;
}

export default function ReceiptPreview({ transaction, onCorrect, onDone }: ReceiptPreviewProps) {
    const handlePrint = async () => {
        try {
            // In real scenario, would call edge function /generate-pdf
            console.log('Printing receipt', transaction.id);
            // const response = await supabase.functions.invoke('generate-pdf', {
            //   body: { transaction_id: transaction.id }
            // });
            alert('Fitur cetak struk PDF akan memanggil Edge Function');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto bg-[#020617] text-white">
            <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-sm font-mono mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                <div className="text-center font-black text-xl mb-6 tracking-widest text-primary uppercase">Struk Pembayaran</div>

                <div className="border-b border-slate-700 border-dashed pb-4 mb-4 space-y-2">
                    <div className="flex justify-between text-slate-400">
                        <span className="font-bold">ID Transaksi:</span>
                        <span className="text-white font-black">{transaction.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span className="font-bold">Waktu:</span>
                        <span className="text-white font-black">{new Date().toLocaleString('id-ID', { hour12: false })}</span>
                    </div>
                    {transaction.customer_id && (
                        <div className="flex justify-between text-slate-400">
                            <span className="font-bold">Konsumen:</span>
                            <span className="text-white font-black">{transaction.customer_name || 'Pelanggan'}</span>
                        </div>
                    )}
                </div>

                <div className="mb-4 border-b border-slate-700 border-dashed pb-4 space-y-4">
                    {transaction.items.map((item: any, i: number) => (
                        <div key={i} className="space-y-1">
                            <div className="font-black text-slate-100">{item.product_name}</div>
                            <div className="flex justify-between text-slate-400 font-bold">
                                <span>{item.qty} {item.unit.unit_type} x {formatCurrency(item.unit.price_sell).replace('Rp', '').trim()}</span>
                                <span className="text-white">{formatCurrency(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-b border-slate-700 border-dashed pb-4 mb-4 space-y-3">
                    <div className="flex justify-between text-xl font-black text-white">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(transaction.total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold">
                        <span className="uppercase text-xs tracking-widest">Bayar ({transaction.payment_method})</span>
                        <span className="text-white">{formatCurrency(transaction.paid_amount)}</span>
                    </div>
                    {transaction.payment_method === 'CASH' && transaction.paid_amount > transaction.total && (
                        <div className="flex justify-between text-slate-400 font-bold">
                            <span className="uppercase text-xs tracking-widest">Kembalian</span>
                            <span className="text-green-400">{formatCurrency(transaction.paid_amount - transaction.total)}</span>
                        </div>
                    )}
                    {transaction.payment_method === 'KREDIT' && (
                        <div className="flex justify-between text-slate-400 font-bold">
                            <span className="uppercase text-xs tracking-widest text-red-400">Sisa Hutang</span>
                            <span className="text-red-400">{formatCurrency(transaction.total - transaction.paid_amount)}</span>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-slate-500 mt-6 font-bold uppercase tracking-widest">
                    --- Terima Kasih ---
                </div>
            </div>

            <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={onCorrect}
                    className="flex items-center justify-center gap-2 bg-[#0f172a] border border-slate-700 py-4 rounded-2xl font-black text-slate-300 hover:text-white transition-all active:scale-95"
                >
                    <Edit2 size={18} /> Koreksi
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-primary/20 border border-primary/30 text-primary py-4 rounded-2xl font-black hover:bg-primary/30 transition-all active:scale-95 shadow-lg shadow-primary/10"
                >
                    <Printer size={18} /> Cetak
                </button>
            </div>

            <button
                onClick={onDone}
                className="w-full max-w-sm flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-xl transition-all active:scale-[0.98] shadow-2xl shadow-primary/20"
            >
                <CheckCircle size={22} /> Selesai
            </button>
        </div>
    );
}
