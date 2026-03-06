import { useState } from 'react';
import { Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import type { CashflowSummary, PaymentStatus, DueDateStatus } from '@/types/cashflow';

interface CashflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CashflowSummary | undefined;
  isLoading?: boolean;
}

interface SectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ExpandableSection({ title, count, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-slate-700 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{title}</span>
          <span className="text-slate-500 text-sm">({count})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-slate-400" size={18} />
        ) : (
          <ChevronDown className="text-slate-400" size={18} />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    LUNAS: 'bg-green-500/20 text-green-400 border-green-500/30',
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'MENUNGGU KONFIRMASI':
      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <span
      className={cn(
        'text-xs px-2 py-1 rounded-full border',
        config[status]
      )}
    >
      {status}
    </span>
  );
}

function DueDateBadge({ status, dueDate }: { status: DueDateStatus; dueDate: string }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (status === 'OVERDUE') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
          LEWAT JATUH TEMPO
        </span>
        <span className="text-xs text-slate-500">{formatDate(dueDate)}</span>
      </div>
    );
  }

  if (status === 'WARNING') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium">
          AKAN JATUH TEMPO
        </span>
        <span className="text-xs text-slate-500">{formatDate(dueDate)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-slate-500">{formatDate(dueDate)}</span>
    </div>
  );
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CashflowModal({
  isOpen,
  onClose,
  data,
  isLoading,
}: CashflowModalProps) {
  const [expandedSections, setExpandedSections] = useState<{
    cash: boolean;
    cashless: boolean;
    receivables: boolean;
  }>({
    cash: true,
    cashless: false,
    receivables: false,
  });

  const toggleSection = (section: 'cash' | 'cashless' | 'receivables') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cashflow Hari Ini"
      icon={<Wallet size={20} />}
      size="2xl"
      bodyClassName="p-0"
    >
      {isLoading || !data ? (
        <div className="p-6 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Cash Transactions Section */}
          <ExpandableSection
            title="Transaksi Cash"
            count={data.cash_transactions.length}
            isExpanded={expandedSections.cash}
            onToggle={() => toggleSection('cash')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Waktu
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Pelanggan
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Item
                    </th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.cash_transactions.map((trx) => (
                    <tr
                      key={trx.id}
                      className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30"
                    >
                      <td className="py-2 px-3 text-slate-300">
                        {formatTime(trx.created_at)}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {trx.customer_name || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {trx.items?.join(', ') || '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-white font-medium">
                        {formatCurrency(trx.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ExpandableSection>

          {/* Cashless Transactions Section */}
          <ExpandableSection
            title="Transaksi Cashless"
            count={data.cashless_transactions.length}
            isExpanded={expandedSections.cashless}
            onToggle={() => toggleSection('cashless')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Waktu
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Metode
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Pelanggan
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Status
                    </th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.cashless_transactions.map((trx) => (
                    <tr
                      key={trx.id}
                      className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30"
                    >
                      <td className="py-2 px-3 text-slate-300">
                        {formatTime(trx.created_at)}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-xs">
                          {trx.payment_method}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {trx.customer_name || '-'}
                      </td>
                      <td className="py-2 px-3">
                        {trx.status && <PaymentStatusBadge status={trx.status} />}
                      </td>
                      <td className="py-2 px-3 text-right text-white font-medium">
                        {formatCurrency(trx.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ExpandableSection>

          {/* Accounts Receivable Section */}
          <ExpandableSection
            title="Piutang Pelanggan"
            count={data.accounts_receivable.length}
            isExpanded={expandedSections.receivables}
            onToggle={() => toggleSection('receivables')}
          >
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Pelanggan
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Jatuh Tempo
                    </th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">
                      Total Hutang
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.accounts_receivable.map((ar) => (
                    <tr
                      key={ar.id}
                      className={cn(
                        'border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30',
                        ar.due_date_status === 'OVERDUE' && 'bg-red-500/5'
                      )}
                    >
                      <td className="py-2 px-3">
                        <div>
                          <div className="text-white font-medium">
                            {ar.customer.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ar.transaction_count} transaksi
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <DueDateBadge
                          status={ar.due_date_status}
                          dueDate={ar.due_date}
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={cn(
                            'font-medium',
                            ar.due_date_status === 'OVERDUE'
                              ? 'text-red-400'
                              : 'text-white'
                          )}
                        >
                          {formatCurrency(ar.total_debt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ExpandableSection>
        </>
      )}
    </BottomSheetModal>
  );
}
