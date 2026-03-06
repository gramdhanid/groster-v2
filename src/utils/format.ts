export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format angka besar ke format Indonesian yang pendek
 * Contoh: 1.500.000 → "1,5 Jt", 50.000 → "50 Rb"
 */
export const formatCompactNumber = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    if (value >= 1_000_000) {
        const formatted = (value / 1_000_000).toFixed(1);
        return formatted.replace(/\.0$/, '') + ' Jt';
    }
    if (value >= 1_000) {
        return Math.floor(value / 1_000) + ' Rb';
    }
    return String(value);
};
