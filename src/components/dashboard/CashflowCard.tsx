import {
  ChevronRight,
  DollarSign,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import type { CashflowSummary } from "@/types/cashflow";

interface CashflowCardProps {
  data: CashflowSummary | undefined;
  isLoading?: boolean;
  onClick?: () => void;
}

const cashflowConfig = {
  cash: {
    Icon: DollarSign,
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    label: "Cash",
  },
  cashless: {
    Icon: CreditCard,
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    label: "Cashless",
  },
  receivables: {
    Icon: AlertCircle,
    bgClass: "bg-orange-500/20",
    textClass: "text-orange-400",
    label: "Piutang",
  },
} as const;

/**
 * Cashflow Card Component
 * Single clickable card showing all three metrics (Cash, Cashless, Piutang)
 * Opens the CashflowModal when clicked
 *
 * Value-first layout: amounts on top, icons in middle, labels on bottom
 */
export default function CashflowCard({
  data,
  isLoading,
  onClick,
}: CashflowCardProps) {
  if (isLoading || !data) {
    return (
      <Card className="bg-[#0f172a] border-slate-800">
        <CardContent className="px-4 py-3">
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
            {/* Cash column skeleton */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-6 bg-slate-700 rounded w-20"></div>
              <div className="h-5 w-5 rounded-full bg-slate-700"></div>
              <div className="h-3 bg-slate-700 rounded w-10"></div>
            </div>
            {/* Cashless column skeleton */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-6 bg-slate-700 rounded w-20"></div>
              <div className="h-5 w-5 rounded-full bg-slate-700"></div>
              <div className="h-3 bg-slate-700 rounded w-14"></div>
            </div>
            {/* Piutang column skeleton with chevron */}
            <div className="flex flex-col items-center gap-1.5 relative">
              <div className="h-6 bg-slate-700 rounded w-20"></div>
              <div className="h-5 w-5 rounded-full bg-slate-700"></div>
              <div className="h-3 bg-slate-700 rounded w-12"></div>
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      type: "cash" as const,
      amount: data.cash_total,
    },
    {
      type: "cashless" as const,
      amount: data.cashless_total,
    },
    {
      type: "receivables" as const,
      amount: data.total_receivables,
    },
  ];

  return (
    <Card
      className="bg-[#0f172a] border-slate-800 cursor-pointer hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-200 group"
      onClick={onClick}
    >
      <CardContent className="px-4 py-3">
        {/* Value-first layout: 3 equal columns, stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
          {metrics.map((metric) => {
            const config = cashflowConfig[metric.type];
            const { Icon } = config;
            const isLastColumn = metric.type === "receivables";

            return (
              <div
                key={metric.type}
                className={`flex flex-col items-center gap-1.5 ${isLastColumn ? "relative" : ""}`}
              >
                {/* Amount - prominent, large, white */}
                <span className="text-lg font-bold text-white leading-tight">
                  {formatCurrency(metric.amount)}
                </span>

                {/* Icon - color-coded, centered */}
                <div className={`p-1 rounded-lg ${config.bgClass}`}>
                  <Icon
                    className={config.textClass}
                    size={16}
                    strokeWidth={2.5}
                  />
                </div>

                {/* Label - subtle, small, muted */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">{config.label}</span>
                  {isLastColumn && (
                    <ChevronRight
                      className="text-slate-500 group-hover:text-slate-400 transition-colors"
                      size={14}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
