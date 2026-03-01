import {
  FileText,
  Download,
  ChevronRight,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  User,
  Package,
  Receipt,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { formatCurrency } from "../utils/format";
import DatePeriodModal from "@/components/filters/DatePeriodModal";
import type { PeriodType } from "@/utils/date";
import { getPeriodLabel, filterTransactionsByPeriod } from "@/utils/date";

interface TransactionRecord {
  id: string;
  created_at: string;
  total: number;
  payment_method: "CASH" | "NON_CASH" | "KREDIT";
  items_count: number;
  customer_name?: string;
  items?: TransactionItem[];
  cashier_name?: string;
  paid_amount?: number;
  change_amount?: number;
}

interface TransactionItem {
  product_id: string;
  product_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TX-001",
    created_at: new Date().toISOString(),
    total: 156000,
    payment_method: "CASH",
    items_count: 5,
    cashier_name: "Kasir 1",
    paid_amount: 160000,
    change_amount: 4000,
    items: [
      {
        product_id: "1",
        product_name: "Indomie Goreng",
        qty: 5,
        unit: "Pcs",
        unit_price: 3500,
        subtotal: 17500,
      },
      {
        product_id: "2",
        product_name: "Teh Pucuk Harum 350ml",
        qty: 10,
        unit: "Botol",
        unit_price: 4000,
        subtotal: 40000,
      },
      {
        product_id: "3",
        product_name: "Gudang Garam Filter 12",
        qty: 2,
        unit: "Bungkus",
        unit_price: 25000,
        subtotal: 50000,
      },
      {
        product_id: "4",
        product_name: "Beras Raja Lele 5kg",
        qty: 1,
        unit: "Karung",
        unit_price: 75000,
        subtotal: 75000,
      },
    ],
  },
  {
    id: "TX-002",
    created_at: new Date().toISOString(),
    total: 42000,
    payment_method: "NON_CASH",
    items_count: 2,
    cashier_name: "Kasir 1",
    paid_amount: 42000,
    change_amount: 0,
    items: [
      {
        product_id: "2",
        product_name: "Teh Pucuk Harum 350ml",
        qty: 6,
        unit: "Botol",
        unit_price: 4000,
        subtotal: 24000,
      },
      {
        product_id: "5",
        product_name: "Aqua 600ml",
        qty: 3,
        unit: "Botol",
        unit_price: 6000,
        subtotal: 18000,
      },
    ],
  },
  {
    id: "TX-003",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    total: 850000,
    payment_method: "KREDIT",
    items_count: 12,
    customer_name: "Bu Siti",
    cashier_name: "Kasir 2",
    items: [
      {
        product_id: "3",
        product_name: "Gudang Garam Filter 12",
        qty: 20,
        unit: "Bungkus",
        unit_price: 25000,
        subtotal: 500000,
      },
      {
        product_id: "6",
        product_name: "Rokok Sampoerna",
        qty: 10,
        unit: "Bungkus",
        unit_price: 35000,
        subtotal: 350000,
      },
    ],
  },
  {
    id: "TX-004",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    total: 24000,
    payment_method: "CASH",
    items_count: 1,
    cashier_name: "Kasir 2",
    paid_amount: 50000,
    change_amount: 26000,
    items: [
      {
        product_id: "2",
        product_name: "Teh Pucuk Harum 350ml",
        qty: 6,
        unit: "Botol",
        unit_price: 4000,
        subtotal: 24000,
      },
    ],
  },
];

export default function Reports() {
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{
    type: PeriodType;
    startDate: Date;
    endDate: Date;
  }>({
    type: "today",
    startDate: new Date(),
    endDate: new Date(),
  });

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(
      MOCK_TRANSACTIONS,
      selectedPeriod.startDate,
      selectedPeriod.endDate,
    );
  }, [selectedPeriod]);

  // Calculate omzet for filtered period
  const currentOmzet = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  }, [filteredTransactions]);

  // Calculate profit (assuming 20% margin for mock)
  const currentProfit = useMemo(() => {
    return Math.round(currentOmzet * 0.2);
  }, [currentOmzet]);

  const handlePeriodSelect = (
    period: PeriodType,
    startDate: Date,
    endDate: Date,
  ) => {
    setSelectedPeriod({ type: period, startDate, endDate });
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return (
          <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/20">
            <Banknote size={12} /> Cash
          </span>
        );
      case "NON_CASH":
        return (
          <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-500/20">
            <Smartphone size={12} /> Non-Cash
          </span>
        );
      case "KREDIT":
        return (
          <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-500/20">
            <CreditCard size={12} /> Kredit
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex justify-between items-center text-white">
        <h1 className="text-3xl font-bold">Laporan</h1>
        <button className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 shadow-sm hover:bg-slate-800 transition-colors">
          <Download size={18} /> Export
        </button>
      </div>

      <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 space-y-4">
        {/* Period Filter */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Periode</span>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <CalendarIcon size={16} />
            {getPeriodLabel(
              selectedPeriod.type,
              selectedPeriod.startDate,
              selectedPeriod.endDate,
            )}
          </button>
        </div>

        {/* Omzet & Profit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-medium">
              Omzet Periode Ini
            </div>
            <div className="text-lg font-black text-primary">
              {formatCurrency(currentOmzet)}
            </div>
          </div>
          <div className="space-y-1 text-right border-l pl-4 border-slate-800">
            <div className="text-xs text-slate-500 font-medium">
              Toko Profit
            </div>
            <div className="text-lg font-black text-white">
              {formatCurrency(currentProfit)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-bold text-slate-300">Sales per Kategori</h2>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 space-y-4">
          <div className="space-y-3">
            {[
              { name: "Rokok", amount: 4500000, color: "bg-primary" },
              { name: "Minuman", amount: 3200000, color: "bg-blue-500" },
              { name: "Mie & Snack", amount: 1800000, color: "bg-orange-500" },
              { name: "Sembako", amount: 1200000, color: "bg-green-500" },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{cat.name}</span>
                  <span className="text-white">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{ width: `${(cat.amount / 4500000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-2">Kategori</th>
                  <th className="pb-2 text-right">Items</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 font-medium">
                <tr>
                  <td className="py-2">Rokok & Tembakau</td>
                  <td className="py-2 text-right">142</td>
                  <td className="py-2 text-right">{formatCurrency(4500000)}</td>
                </tr>
                <tr className="border-t border-slate-800/50">
                  <td className="py-2">Minuman</td>
                  <td className="py-2 text-right">86</td>
                  <td className="py-2 text-right">{formatCurrency(3200000)}</td>
                </tr>
                <tr className="border-t border-slate-800/50">
                  <td className="py-2">Mie & Snack</td>
                  <td className="py-2 text-right">114</td>
                  <td className="py-2 text-right">{formatCurrency(1800000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-bold text-slate-300">Riwayat Transaksi</h2>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="text-primary text-sm font-bold flex items-center gap-1"
          >
            <CalendarIcon size={16} />{" "}
            {getPeriodLabel(
              selectedPeriod.type,
              selectedPeriod.startDate,
              selectedPeriod.endDate,
            )}
          </button>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {tx.id}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                      {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {tx.items_count} item
                    </div>
                  </div>
                  {getMethodBadge(tx.payment_method)}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-lg font-black text-white">
                      {formatCurrency(tx.total)}
                    </div>
                    {tx.customer_name && (
                      <div className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md mt-1 w-fit border border-red-500/20">
                        {tx.customer_name} (Belum Lunas)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedTx(tx)}
                    className="p-2 bg-slate-800 rounded-lg text-slate-500 group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0f172a] p-8 rounded-xl shadow-sm border border-slate-800 text-center">
              <div className="text-slate-500 mb-2">Tidak ada transaksi</div>
              <div className="text-slate-600 text-sm">
                Silakan pilih periode lain
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="w-full bg-[#0f172a] border border-slate-800 py-4 rounded-xl font-bold text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
        <FileText size={20} /> Lihat Semua Laporan
      </button>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#0f172a] w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-white animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Receipt className="text-primary" size={24} />
                Detail Transaksi
              </h2>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#020617]">
              {/* Transaction Info */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {selectedTx.id}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={14} />
                    {new Date(selectedTx.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {getMethodBadge(selectedTx.payment_method)}
              </div>

              {/* Customer Info */}
              {selectedTx.customer_name && (
                <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <User size={14} />
                    Pelanggan
                  </div>
                  <div className="text-white font-bold">
                    {selectedTx.customer_name}
                  </div>
                  {selectedTx.payment_method === "KREDIT" && (
                    <div className="text-red-400 text-xs mt-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 inline-block">
                      Belum Lunas
                    </div>
                  )}
                </div>
              )}

              {/* Cashier Info */}
              {selectedTx.cashier_name && (
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <User size={14} />
                  <span>
                    Kasir:{" "}
                    <span className="text-slate-300">
                      {selectedTx.cashier_name}
                    </span>
                  </span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                  <Package size={16} />
                  Item Pembelian (
                  {selectedTx.items?.length || selectedTx.items_count})
                </div>
                <div className="space-y-2">
                  {selectedTx.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-slate-100">
                          {item.product_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.qty} {item.unit} ×{" "}
                          {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <div className="text-primary font-black">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span className="text-white">
                    {formatCurrency(selectedTx.total)}
                  </span>
                </div>
                {selectedTx.payment_method === "CASH" &&
                  selectedTx.paid_amount !== undefined && (
                    <>
                      <div className="flex justify-between text-slate-400 text-sm">
                        <span>Bayar</span>
                        <span className="text-white">
                          {formatCurrency(selectedTx.paid_amount)}
                        </span>
                      </div>
                      {selectedTx.change_amount !== undefined &&
                        selectedTx.change_amount > 0 && (
                          <div className="flex justify-between text-slate-400 text-sm">
                            <span>Kembalian</span>
                            <span className="text-green-400">
                              {formatCurrency(selectedTx.change_amount)}
                            </span>
                          </div>
                        )}
                    </>
                  )}
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-bold">Total</span>
                    <span className="text-2xl font-black text-primary">
                      {formatCurrency(selectedTx.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 shrink-0 bg-[#0f172a] border-t border-slate-800 space-y-3">
              <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Download size={20} /> Cetak Struk
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Period Filter Modal */}
      <DatePeriodModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onPeriodSelect={handlePeriodSelect}
        currentPeriod={selectedPeriod.type}
        currentStartDate={selectedPeriod.startDate}
        currentEndDate={selectedPeriod.endDate}
      />
    </div>
  );
}
