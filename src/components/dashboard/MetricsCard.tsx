import { Wallet, Receipt, TrendingUp, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import SyncStatusModal from "@/components/layout/SyncStatusModal";
import { useState } from "react";
import type { CashflowSummary } from "@/types/cashflow";

type CashflowCategory = 'cash' | 'cashless' | 'receivables';

interface MetricsCardProps {
  revenue: number;
  netProfit: number;
  transactions: number;
  revenueGrowth: number;
  profitGrowth: number;
  transactionGrowth: number;
  isLoading?: boolean;
  cashflowData?: CashflowSummary;
  cashflowLoading?: boolean;
  onCashflowClick?: (category: CashflowCategory) => void;
}

export default function MetricsCard({
  revenue,
  netProfit,
  transactions,
  revenueGrowth,
  profitGrowth,
  transactionGrowth,
  isLoading = false,
  cashflowData,
  cashflowLoading = false,
  onCashflowClick,
}: MetricsCardProps) {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">(
    "synced",
  );
  const [pendingCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSyncClick = () => {
    setIsSyncModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/20 to-green-800/20 rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-40" />
      </div>
    );
  }

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCategoryClick = (category: CashflowCategory) => {
    if (onCashflowClick) {
      onCashflowClick(category);
    }
  };

  return (
    <>
      <div
        className="relative bg-gradient-to-br from-primary to-green-800 rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-200 hover:scale-[1.01] cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Header - Pendapatan (Main Metric) */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-white/70" />
                <p className="text-sm text-white/80 font-medium">Pendapatan</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {isHidden ? "•••••••" : formatCurrency(revenue)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <p
                  className={`text-sm font-medium ${revenueGrowth >= 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {revenueGrowth >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(revenueGrowth).toFixed(1)}% dari kemarin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsHidden(!isHidden)}
                className="p-2 text-white/50 hover:text-white/80 transition-colors"
              >
                {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSyncClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white font-medium text-sm transition-all active:scale-95"
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncStatus === "pending" ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20 my-4" />

          {/* Two smaller metrics side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Laba Bersih */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="w-3.5 h-3.5 text-white/70" />
                <p className="text-xs text-white/80">Laba Bersih</p>
              </div>
              <p className="text-xl font-semibold text-white">
                {isHidden ? "•••••••" : formatCurrency(netProfit)}
              </p>
              <p
                className={`text-xs font-medium ${profitGrowth >= 0 ? "text-green-300" : "text-red-300"}`}
              >
                {profitGrowth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(profitGrowth).toFixed(1)}%
              </p>
            </div>

            {/* Transaksi */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="w-3.5 h-3.5 text-white/70" />
                <p className="text-xs text-white/80">Transaksi</p>
              </div>
              <p className="text-xl font-semibold text-white">{transactions}</p>
              <p
                className={`text-xs font-medium ${transactionGrowth >= 0 ? "text-green-300" : "text-red-300"}`}
              >
                {transactionGrowth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(transactionGrowth).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Expandable Cashflow Section */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-t border-white/20 my-4" />

            {/* Cashflow Content */}
            {cashflowLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
                    <div className="h-5 bg-white/20 rounded w-16"></div>
                    <div className="h-5 w-5 rounded-full bg-white/20"></div>
                    <div className="h-3 bg-white/20 rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : cashflowData ? (
              <div className="grid grid-cols-3 gap-4">
                {/* Tunai */}
                <button
                  onClick={() => handleCategoryClick('cash')}
                  className="flex flex-col items-center gap-1.5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <div className="p-1 rounded-lg bg-green-400/20">
                    <DollarSign className="text-green-300" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-white/80">Tunai</span>
                </button>

                {/* Non-Tunai */}
                <button
                  onClick={() => handleCategoryClick('cashless')}
                  className="flex flex-col items-center gap-1.5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <div className="p-1 rounded-lg bg-blue-400/20">
                    <CreditCard className="text-blue-300" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-white/80">Non-Tunai</span>
                </button>

                {/* Piutang */}
                <button
                  onClick={() => handleCategoryClick('receivables')}
                  className="flex flex-col items-center gap-1.5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <div className="p-1 rounded-lg bg-orange-400/20">
                    <AlertCircle className="text-orange-300" size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-white/80">Piutang</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Chevron indicator */}
          <div className="flex justify-center mt-4">
            <button
              className="p-1 text-white/40 hover:text-white/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        onSync={() => {
          setSyncStatus("pending");
          setTimeout(() => setSyncStatus("synced"), 2000);
        }}
      />
    </>
  );
}
