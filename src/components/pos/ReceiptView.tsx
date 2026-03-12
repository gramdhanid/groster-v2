import { ArrowLeft, Printer, Share2, CheckCircle, Receipt as ReceiptIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface TransactionItem {
    product_id: string;
    product_name: string;
    qty: number;
    unit: { unit_type: string; price_sell: number };
    unit_price: number;
    subtotal: number;
    discount?: { type: 'percent' | 'fixed'; value: number; reason?: string };
}

interface Transaction {
    id: string;
    created_at: string;
    subtotal: number;
    discount: number;
    fee: number;
    total: number;
    payment_method: string;
    paid_amount: number;
    change: number;
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
    items: TransactionItem[];
    additional_fee?: { name: string; amount: number } | null;
}

interface ReceiptViewProps {
    transaction: Transaction;
    onNewTransaction: () => void;
    onBack: () => void;
}

export default function ReceiptView({ transaction, onNewTransaction, onBack }: ReceiptViewProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Struk Transaksi',
                    text: `Total: ${formatCurrency(transaction.total)}`,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    };

    const paymentMethodLabels: Record<string, string> = {
        CASH: 'Tunai',
        NON_CASH: 'Non-Tunai',
        KREDIT: 'Piutang',
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-black text-white">Struk Transaksi</h1>
                    <div className="w-10" /> {/* Spacer for balance */}
                </div>
            </div>

            {/* Success Indicator */}
            <div className="p-6 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Transaksi Berhasil!</h2>
                <p className="text-slate-400">ID: {transaction.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Receipt Card */}
            <div className="px-4 flex-1">
                <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Receipt Header */}
                    <div className="p-6 border-b border-dashed border-slate-300">
                        <div className="text-center">
                            <h3 className="text-xl font-black tracking-tight">TOKO SEMBAKO</h3>
                            <p className="text-sm text-slate-600 mt-1">Jl. Contoh No. 123</p>
                            <p className="text-sm text-slate-600">Telp: 08123456789</p>
                        </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="p-6 border-b border-dashed border-slate-300 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-600">Tanggal</span>
                            <span className="font-semibold">
                                {new Date(transaction.created_at).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-600">Kasir</span>
                            <span className="font-semibold">Admin</span>
                        </div>
                        {transaction.customer_name && (
                            <>
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Pelanggan</span>
                                    <span className="font-semibold">{transaction.customer_name}</span>
                                </div>
                                {transaction.customer_phone && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Telepon</span>
                                        <span className="font-semibold">{transaction.customer_phone}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Items */}
                    <div className="p-6 border-b border-dashed border-slate-300">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-600">Item</th>
                                    <th className="text-center py-2 font-semibold text-slate-600">Qty</th>
                                    <th className="text-right py-2 font-semibold text-slate-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.items.map((item, idx) => {
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                                            <td className="py-3">
                                                <div className="font-semibold">{item.product_name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {formatCurrency(item.unit_price)} / {item.unit.unit_type}
                                                </div>
                                                {item.discount && (
                                                    <div className="text-xs text-orange-500">
                                                        Diskon {item.discount.type === 'percent' ? `${item.discount.value}%` : formatCurrency(item.discount.value)}
                                                        {item.discount.reason && ` (${item.discount.reason})`}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center py-3">
                                                {item.qty} {item.unit.unit_type}
                                            </td>
                                            <td className="text-right py-3 font-semibold">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="p-6 border-b border-dashed border-slate-300 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-semibold">{formatCurrency(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className="flex justify-between text-sm text-orange-600">
                                <span>Diskon</span>
                                <span className="font-semibold">-{formatCurrency(transaction.discount)}</span>
                            </div>
                        )}
                        {transaction.fee > 0 && (
                            <div className="flex justify-between text-sm text-blue-600">
                                <span>{transaction.additional_fee?.name || 'Biaya Tambahan'}</span>
                                <span className="font-semibold">+{formatCurrency(transaction.fee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="font-bold text-lg">TOTAL</span>
                            <span className="font-black text-xl">{formatCurrency(transaction.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                            <span className="text-slate-600">Metode</span>
                            <span className="font-semibold">{paymentMethodLabels[transaction.payment_method] || transaction.payment_method}</span>
                        </div>
                        {transaction.payment_method === 'CASH' && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Bayar</span>
                                    <span className="font-semibold">{formatCurrency(transaction.paid_amount)}</span>
                                </div>
                                {transaction.change > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Kembali</span>
                                        <span className="font-semibold">{formatCurrency(transaction.change)}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {transaction.payment_method === 'KREDIT' && transaction.paid_amount < transaction.total && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Sisa Piutang</span>
                                <span className="font-semibold">{formatCurrency(transaction.total - transaction.paid_amount)}</span>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {transaction.notes && (
                        <div className="p-6 border-b border-dashed border-slate-300">
                            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2">
                                Catatan
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{transaction.notes}</div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-6 text-center">
                        <p className="text-sm text-slate-600 mb-2">Terima kasih atas kunjungan Anda!</p>
                        <p className="text-xs text-slate-500">Barang yang sudah dibeli tidak dapat ditukar</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-[#0f172a] border-t border-slate-800">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={handleShare}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                    >
                        <Share2 size={20} />
                        Bagikan
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                    >
                        <Printer size={20} />
                        Cetak
                    </button>
                </div>
                <div className="max-w-2xl mx-auto mt-3">
                    <button
                        onClick={onNewTransaction}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <ReceiptIcon size={20} />
                        Transaksi Baru
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body > *:not(.receipt-printable) {
                        display: none !important;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
