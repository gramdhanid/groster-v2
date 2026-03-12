import { formatCurrency } from './format';

/**
 * Generate preset amounts for cash payments
 * Returns the exact amount plus common denominations >= total
 */
export const generatePresets = (total: number): number[] => {
    const base = [5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const valid = base.filter((amt) => amt >= total);
    return [total, ...valid.slice(0, 4)];
};

/**
 * Format numpad display value
 */
export const formatNumpadDisplay = (value: string): string => {
    if (!value) return 'Rp 0';
    return formatCurrency(Number(value));
};

/**
 * Validate payment amount based on payment method
 */
export const validatePaymentAmount = (
    paid: number,
    total: number,
    method: string
): { valid: boolean; message?: string } => {
    if (method === 'CASH' && paid < total) {
        return { valid: false, message: `Kurang ${formatCurrency(total - paid)}` };
    }
    return { valid: true };
};

/**
 * Get CSS classes for preset button
 */
export const getPresetButtonClasses = (isSelected: boolean): string => {
    const base = 'py-4 rounded-2xl font-black text-lg border-2 transition-all active:scale-95';
    return isSelected
        ? `${base} bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20`
        : `${base} bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-600`;
};

/**
 * Get CSS classes for non-cash method button
 */
export const getMethodButtonClasses = (isSelected: boolean): string => {
    const base = 'p-6 rounded-2xl font-bold text-lg border-2 transition-all';
    return isSelected
        ? `${base} bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20`
        : `${base} bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600`;
};

/**
 * Get CSS classes for customer select button
 */
export const getCustomerSelectButtonClasses = (isSelected: boolean): string => {
    const base = 'w-full p-5 rounded-2xl font-black text-lg outline-none appearance-none cursor-pointer transition-all';
    return isSelected
        ? `${base} bg-primary text-white border-2 border-primary shadow-lg shadow-primary/20`
        : `${base} bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600`;
};
