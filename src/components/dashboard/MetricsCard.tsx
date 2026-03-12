import { Wallet, Receipt, TrendingUp, RefreshCw, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import SyncStatusModal from "@/components/layout/SyncStatusModal";
import { useState } from "react";

interface MetricsCardProps {
  revenue: number;
  netProfit: number;
  transactions: number;
  revenueGrowth: number;
  profitGrowth: number;
  transactionGrowth: number;
  isLoading?: boolean;
}

export default function MetricsCard({
  revenue,
  netProfit,
  transactions,
  revenueGrowth,
  profitGrowth,
  transactionGrowth,
  isLoading = false,
}: MetricsCardProps) {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">(
    "synced",
  );
  const [pendingCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

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

  return (
    <>
      <div className="relative bg-gradient-to-br from-primary to-green-800 rounded-2xl p-6 shadow-lg overflow-hidden">
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
            <div className="flex items-center gap-1">
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
