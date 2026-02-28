import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    format,
    isWithinInterval
} from 'date-fns';
import { id } from 'date-fns/locale';

export type PeriodType = 'today' | 'this_week' | 'this_month' | 'custom';

export const getPeriodLabel = (type: PeriodType, customStart?: Date, customEnd?: Date): string => {
    switch (type) {
        case 'today': return 'Hari Ini';
        case 'this_week': return 'Minggu Ini';
        case 'this_month': return 'Bulan Ini';
        case 'custom':
            if (customStart && customEnd) {
                return `${format(customStart, 'd MMM', { locale: id })} - ${format(customEnd, 'd MMM yyyy', { locale: id })}`;
            }
            return 'Custom';
        default:
            return '';
    }
};

export const getPeriodRange = (type: PeriodType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } => {
    const now = new Date();
    switch (type) {
        case 'today':
            return { start: startOfDay(now), end: endOfDay(now) };
        case 'this_week':
            return { start: startOfWeek(now, { locale: id }), end: endOfWeek(now, { locale: id }) };
        case 'this_month':
            return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'custom':
            return {
                start: customStart ? startOfDay(customStart) : startOfDay(now),
                end: customEnd ? endOfDay(customEnd) : endOfDay(now)
            };
        default:
            return { start: startOfDay(now), end: endOfDay(now) };
    }
};

export const filterTransactionsByPeriod = <T extends { created_at: string }>(
    transactions: T[],
    startDate: Date,
    endDate: Date
): T[] => {
    return transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return isWithinInterval(txDate, { start: startDate, end: endDate });
    });
};
