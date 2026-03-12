import { formatCurrency } from "../../utils/format";
import {
  formatNumpadDisplay,
  generatePresets,
  getPresetButtonClasses,
} from "../../utils/paymentHelpers";

interface CashPaymentPanelProps {
  total: number;
  paidAmount: number;
  customInput: string;
  onPresetClick: (amount: number) => void;
  onInputChange: (value: string) => void;
}

export default function CashPaymentPanel({
  total,
  paidAmount,
  customInput,
  onPresetClick,
  onInputChange,
}: CashPaymentPanelProps) {
  const presets = generatePresets(total);

  return (
    <div className="space-y-6">
      {/* Preset Amounts */}
      <div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
          Uang
        </div>
        {/* Input Manual */}
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 mb-6">
          <input
            type="text"
            inputMode="numeric"
            value={formatNumpadDisplay(customInput)}
            onChange={(e) =>
              onInputChange(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full bg-slate-800 rounded-2xl px-6 py-5 text-4xl font-black text-green-400 text-right tracking-tighter focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-slate-600"
            placeholder="Rp 0"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((amt, idx) => (
            <button
              key={idx}
              onClick={() => onPresetClick(amt)}
              className={getPresetButtonClasses(paidAmount === amt)}
            >
              {amt === total ? "Uang Pas" : formatCurrency(amt)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
