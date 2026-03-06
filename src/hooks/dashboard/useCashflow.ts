import { useQuery } from '@tanstack/react-query';
import type { CashflowSummary, Transaction, AccountReceivable, DueDateStatus } from '@/types/cashflow';

/**
 * Helper function to determine due date status
 */
function getDueDateStatus(dueDate: string): DueDateStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'OVERDUE';
  if (diffDays <= 2) return 'WARNING';
  return 'NORMAL';
}

/**
 * Helper function to format date for transaction (today's date with time)
 */
function createTransactionTime(hours: number, minutes: number): string {
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}

/**
 * Hook for fetching cashflow data
 * Returns cashflow summary with dummy data for:
 * - 5 cash transactions
 * - 5 cashless transactions
 * - 5 customers with debt (accounts receivable)
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase queries
 */
export const useCashflow = () => {
  return useQuery({
    queryKey: ['dashboard', 'cashflow'],
    queryFn: async (): Promise<CashflowSummary> => {
      // DUMMY DATA - Replace with Supabase queries when ready
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5 Cash Transactions
      const cashTransactions: Transaction[] = [
        {
          id: 'TRX-CASH-001',
          created_at: createTransactionTime(8, 30),
          total: 350000,
          payment_method: 'CASH',
          customer_name: 'Walk-in',
          status: 'LUNAS',
          items: ['Indomie', 'Teh Pucuk'],
        },
        {
          id: 'TRX-CASH-002',
          created_at: createTransactionTime(10, 15),
          total: 500000,
          payment_method: 'CASH',
          customer_name: 'Walk-in',
          status: 'LUNAS',
          items: ['Beras 5kg'],
        },
        {
          id: 'TRX-CASH-003',
          created_at: createTransactionTime(11, 45),
          total: 275000,
          payment_method: 'CASH',
          customer_name: 'Walk-in',
          status: 'LUNAS',
          items: ['Rokok', 'Snack'],
        },
        {
          id: 'TRX-CASH-004',
          created_at: createTransactionTime(13, 20),
          total: 750000,
          payment_method: 'CASH',
          customer_name: 'Walk-in',
          status: 'LUNAS',
          items: ['Grosir Sembako'],
        },
        {
          id: 'TRX-CASH-005',
          created_at: createTransactionTime(15, 50),
          total: 625000,
          payment_method: 'CASH',
          customer_name: 'Walk-in',
          status: 'LUNAS',
          items: ['Minuman', 'Mie'],
        },
      ];

      // 5 Non-Cash Transactions
      const cashlessTransactions: Transaction[] = [
        {
          id: 'TRX-QRIS-001',
          created_at: createTransactionTime(9, 0),
          total: 450000,
          payment_method: 'QRIS',
          customer_name: 'Toko Berkah',
          status: 'LUNAS',
          items: ['Sembako'],
        },
        {
          id: 'TRX-TRF-001',
          created_at: createTransactionTime(10, 30),
          total: 1200000,
          payment_method: 'TRANSFER',
          customer_name: 'CV Maju Jaya',
          status: 'LUNAS',
          items: ['Grosir Minuman'],
        },
        {
          id: 'TRX-GOPAY-001',
          created_at: createTransactionTime(12, 0),
          total: 320000,
          payment_method: 'GOPAY',
          customer_name: 'Pelanggan Setia',
          status: 'LUNAS',
          items: ['Rokok', 'Minuman'],
        },
        {
          id: 'TRX-OVO-001',
          created_at: createTransactionTime(14, 15),
          total: 280000,
          payment_method: 'OVO',
          customer_name: 'Warung Bu Yati',
          status: 'PENDING',
          items: ['Snack', 'Mie'],
        },
        {
          id: 'TRX-SHOPEE-001',
          created_at: createTransactionTime(16, 30),
          total: 950000,
          payment_method: 'SHOPEEPAY',
          customer_name: 'Toko Kelontong',
          status: 'MENUNGGU KONFIRMASI',
          items: ['Sembako Grosir'],
        },
      ];

      // 5 Customers with Debt (Accounts Receivable)
      const accountsReceivable: AccountReceivable[] = [
        {
          id: 'AR-001',
          customer: {
            id: 'CUST-001',
            name: 'Toko Makmur',
            phone: '081234567890',
            address: 'Jl. Merdeka No. 10',
          },
          total_debt: 1500000,
          due_date: '2026-03-10',
          transaction_count: 3,
          due_date_status: getDueDateStatus('2026-03-10'),
        },
        {
          id: 'AR-002',
          customer: {
            id: 'CUST-002',
            name: 'Warung Bu Siti',
            phone: '081234567891',
            address: 'Jl. Melati No. 5',
          },
          total_debt: 750000,
          due_date: '2026-03-08',
          transaction_count: 2,
          due_date_status: getDueDateStatus('2026-03-08'),
        },
        {
          id: 'AR-003',
          customer: {
            id: 'CUST-003',
            name: 'Kedai Kopi Senja',
            phone: '081234567892',
            address: 'Jl. Kenanga No. 15',
          },
          total_debt: 2000000,
          due_date: '2026-03-15',
          transaction_count: 5,
          due_date_status: getDueDateStatus('2026-03-15'),
        },
        {
          id: 'AR-004',
          customer: {
            id: 'CUST-004',
            name: 'Toko Semesta',
            phone: '081234567893',
            address: 'Jl. Dahlia No. 20',
          },
          total_debt: 500000,
          due_date: '2026-03-07',
          transaction_count: 1,
          due_date_status: getDueDateStatus('2026-03-07'),
        },
        {
          id: 'AR-005',
          customer: {
            id: 'CUST-005',
            name: 'Warung Jaya',
            phone: '081234567894',
            address: 'Jl. Anggrek No. 8',
          },
          total_debt: 1200000,
          due_date: '2026-03-12',
          transaction_count: 4,
          due_date_status: getDueDateStatus('2026-03-12'),
        },
      ];

      // Calculate totals
      const cashTotal = cashTransactions.reduce((sum, t) => sum + t.total, 0);
      const cashlessTotal = cashlessTransactions.reduce((sum, t) => sum + t.total, 0);
      const totalReceivables = accountsReceivable.reduce((sum, ar) => sum + ar.total_debt, 0);

      return {
        cash_total: cashTotal,
        cash_count: cashTransactions.length,
        cashless_total: cashlessTotal,
        cashless_count: cashlessTransactions.length,
        total_receivables: totalReceivables,
        receivables_count: accountsReceivable.length,
        cash_transactions: cashTransactions,
        cashless_transactions: cashlessTransactions,
        accounts_receivable: accountsReceivable,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
