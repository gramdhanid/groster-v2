/**
 * Cashflow type definitions
 * These types define the data structure for cashflow feature
 */

export type PaymentMethod =
  | 'CASH'
  | 'QRIS'
  | 'TRANSFER'
  | 'GOPAY'
  | 'OVO'
  | 'SHOPEEPAY'
  | 'DEBIT';

export type PaymentStatus = 'LUNAS' | 'PENDING' | 'MENUNGGU KONFIRMASI';

export type DueDateStatus = 'OVERDUE' | 'WARNING' | 'NORMAL';

export interface Transaction {
  id: string;
  created_at: string;
  total: number;
  payment_method: PaymentMethod;
  customer_name?: string;
  status?: PaymentStatus;
  items?: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

export interface AccountReceivable {
  id: string;
  customer: Customer;
  total_debt: number;
  due_date: string;
  transaction_count: number;
  due_date_status: DueDateStatus;
}

export interface CashflowSummary {
  cash_total: number;
  cash_count: number;
  cashless_total: number;
  cashless_count: number;
  total_receivables: number;
  receivables_count: number;
  cash_transactions: Transaction[];
  cashless_transactions: Transaction[];
  accounts_receivable: AccountReceivable[];
}
