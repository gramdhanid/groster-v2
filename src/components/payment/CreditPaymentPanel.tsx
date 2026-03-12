import { useState } from 'react';
import { Clock } from 'lucide-react';
import type { Customer } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/format';
import { getCustomerSelectButtonClasses } from '../../utils/paymentHelpers';
import CustomerSelector from '../pos/CustomerSelector';

interface CreditPaymentPanelProps {
    total: number;
    selectedCustomer: Customer | null;
    onCustomerSelect: (customer: Customer | null) => void;
    downPayment: number;
    onDownPaymentChange: (amount: number) => void;
    dueDate: string;
    onDueDateChange: (date: string) => void;
}

export default function CreditPaymentPanel({
    total,
    selectedCustomer,
    onCustomerSelect,
    downPayment,
    onDownPaymentChange,
    dueDate,
    onDueDateChange,
}: CreditPaymentPanelProps) {
    const [showCustomerSelector, setShowCustomerSelector] = useState(false);

    return (
        <div className="space-y-6">
            {/* Customer selection */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                    Pilih Pelanggan
                </label>
                <button
                    onClick={() => setShowCustomerSelector(true)}
                    className={getCustomerSelectButtonClasses(!!selectedCustomer)}
                >
                    {selectedCustomer ? selectedCustomer.name : '-- Pilih Customer --'}
                </button>
            </div>

            {/* Down payment */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                    Bayar Sebagian (DP)
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-500">Rp</span>
                    <input
                        type="number"
                        value={downPayment || ''}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(total, Number(e.target.value) || 0));
                            onDownPaymentChange(val);
                        }}
                        placeholder="0"
                        className="flex-1 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-2xl outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-600"
                    />
                </div>
                <div className="mt-6 flex justify-between text-slate-400 font-black">
                    <span className="uppercase tracking-widest text-xs">Sisa Piutang:</span>
                    <span className="text-red-400 text-xl">{formatCurrency(total - downPayment)}</span>
                </div>
            </div>

            {/* Due date */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
                <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                    <Clock size={16} className="inline mr-1" />
                    Jatuh Tempo
                </label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => onDueDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary text-white"
                />
            </div>

            {/* Customer selector modal */}
            <CustomerSelector
                isOpen={showCustomerSelector}
                onClose={() => setShowCustomerSelector(false)}
                onSelect={onCustomerSelect}
                currentCustomer={selectedCustomer}
            />
        </div>
    );
}
