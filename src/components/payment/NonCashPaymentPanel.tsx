import { getMethodButtonClasses } from '../../utils/paymentHelpers';

export interface NonCashPaymentMethod {
    id: string;
    label: string;
    icon: string;
}

export const NON_CASH_METHODS: NonCashPaymentMethod[] = [
    { id: 'QRIS', label: 'QRIS', icon: '📱' },
    { id: 'TRANSFER', label: 'Transfer', icon: '🏦' },
    { id: 'EWALLET', label: 'E-Wallet', icon: '💳' },
    { id: 'DEBIT', label: 'Kartu Debit', icon: '💳' },
];

interface NonCashPaymentPanelProps {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
    referenceNumber: string;
    onReferenceChange: (ref: string) => void;
}

export default function NonCashPaymentPanel({
    selectedMethod,
    onMethodChange,
    referenceNumber,
    onReferenceChange,
}: NonCashPaymentPanelProps) {
    return (
        <div className="space-y-6">
            {/* Payment method selection */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                    Metode Pembayaran
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {NON_CASH_METHODS.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => onMethodChange(method.id)}
                            className={getMethodButtonClasses(selectedMethod === method.id)}
                        >
                            <div className="text-3xl mb-2">{method.icon}</div>
                            <div>{method.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reference number input */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                    Nomor Referensi (Opsional)
                </div>
                <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => onReferenceChange(e.target.value)}
                    placeholder="Masukkan nomor referensi..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-600"
                />
            </div>
        </div>
    );
}
