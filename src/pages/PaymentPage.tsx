import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Smartphone, Users } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { formatCurrency } from "../utils/format";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ReceiptView from "../components/pos/ReceiptView";
import CashPaymentPanel from "../components/payment/CashPaymentPanel";
import NonCashPaymentPanel from "../components/payment/NonCashPaymentPanel";
import CreditPaymentPanel from "../components/payment/CreditPaymentPanel";
import { useHorizontalSwipe } from "../hooks/useHorizontalSwipe";
import type { Customer } from "../store/useCartStore";

type PaymentTab = "CASH" | "NON_CASH" | "KREDIT";

export default function PaymentPage() {
  const navigate = useNavigate();
  const {
    items,
    getTotal,
    clearCart,
    additionalFee,
    notes,
    customer,
    getSubtotal,
    getTotalDiscount,
  } = useCartStore();

  const total = getTotal();
  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const feeAmount = additionalFee?.amount || 0;

  const [tab, setTab] = useState<PaymentTab>("CASH");
  const tabIndex: number = tab === "CASH" ? 0 : tab === "NON_CASH" ? 1 : 2;
  const [paidAmount, setPaidAmount] = useState<number>(total);
  const [customInput, setCustomInput] = useState<string>(total.toString());
  const [selectedNonCashMethod, setSelectedNonCashMethod] = useState("QRIS");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedCreditCustomer, setSelectedCreditCustomer] =
    useState<Customer | null>(null);
  const [downPayment, setDownPayment] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset states when switching tabs
  const handleTabChange = (newTab: PaymentTab) => {
    setTab(newTab);
    setError(null);

    if (newTab === "CASH") {
      setPaidAmount(total);
      setCustomInput(total.toString());
    } else if (newTab === "NON_CASH") {
      setPaidAmount(total);
      setCustomInput(total.toString());
    } else if (newTab === "KREDIT") {
      setPaidAmount(0);
      setCustomInput("0");
    }
  };

  // Setup swipe gesture handlers for horizontal tab navigation
  const { swipeX, isDragging, touchHandlers } = useHorizontalSwipe({
    onSwipeLeft: () => {
      // Swipe left (←): CASH → NON_CASH → KREDIT
      if (tab === "CASH") handleTabChange("NON_CASH");
      else if (tab === "NON_CASH") handleTabChange("KREDIT");
    },
    onSwipeRight: () => {
      // Swipe right (→): KREDIT → NON_CASH → CASH
      if (tab === "KREDIT") handleTabChange("NON_CASH");
      else if (tab === "NON_CASH") handleTabChange("CASH");
    },
    threshold: 80, // px
  });

  // Constrain swipeX so indicator stays within bounds
  const constrainedSwipeX = isDragging
    ? (() => {
        if (tabIndex === 0) {
          // First tab: can only move right (positive swipeX = move toward next tab)
          return Math.max(0, swipeX);
        } else if (tabIndex === 2) {
          // Last tab: can only move left (negative swipeX = move toward previous tab)
          return Math.min(0, swipeX);
        }
        // Middle tab: both directions allowed
        return swipeX;
      })()
    : 0;

  const handleExit = () => {
    if (completedTransaction) {
      clearCart();
      navigate("/transactions/new");
    } else if (items.length > 0) {
      setShowConfirmExit(true);
    } else {
      navigate("/transactions/new");
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    navigate("/transactions/new");
  };

  const handlePresetClick = (amt: number) => {
    setPaidAmount(amt);
    setCustomInput(amt.toString());
  };

  const handleSubmit = () => {
    setError(null);

    // Validation for credit payments
    if (tab === "KREDIT" && !selectedCreditCustomer) {
      setError("Pilih customer untuk transaksi kredit!");
      return;
    }

    // Validation for cash payments
    if (tab === "CASH" && paidAmount < total) {
      setError("Jumlah pembayaran kurang dari total tagihan!");
      return;
    }

    // Create transaction record
    const transaction = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      subtotal,
      discount: totalDiscount,
      fee: feeAmount,
      total,
      payment_method: tab,
      payment_detail: tab === "NON_CASH" ? selectedNonCashMethod : undefined,
      reference_number: tab === "NON_CASH" ? referenceNumber : undefined,
      paid_amount: tab === "KREDIT" ? downPayment : paidAmount,
      change: tab === "CASH" ? Math.max(0, paidAmount - total) : 0,
      customer_id: tab === "KREDIT" ? selectedCreditCustomer?.id : customer?.id,
      customer_name:
        tab === "KREDIT" ? selectedCreditCustomer?.name : customer?.name,
      customer_phone:
        tab === "KREDIT" ? selectedCreditCustomer?.phone : customer?.phone,
      due_date: tab === "KREDIT" ? dueDate : undefined,
      remaining_debt: tab === "KREDIT" ? total - downPayment : undefined,
      notes,
      items: items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        qty: i.qty,
        unit: i.unit,
        unit_price: i.unit.price_sell,
        discount: i.discount,
        subtotal: i.subtotal,
      })),
      additional_fee: additionalFee,
    };

    setCompletedTransaction(transaction);
  };

  // Show receipt if transaction completed
  if (completedTransaction) {
    return (
      <ReceiptView
        transaction={completedTransaction}
        onNewTransaction={() => {
          clearCart();
          navigate("/transactions/new");
        }}
        onBack={() => setCompletedTransaction(null)}
      />
    );
  }

  return (
    <>
      <div
        className={`min-h-screen bg-[#020617] flex flex-col ${tab === "CASH" && paidAmount > total ? "pb-52" : "pb-32"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-black text-white">Pembayaran</h1>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex shadow-lg bg-[#0f172a] border-b border-slate-800 relative">
          {/* Animated indicator */}
          <div
            className="absolute bottom-0 h-1 transition-transform duration-200 ease-out"
            style={{
              width: '33.333%',
              transform: isDragging
                ? `translateX(calc(${tabIndex * 100}% - ${constrainedSwipeX / 3}px))`
                : `translateX(${tabIndex * 100}%)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              backgroundColor: tab === 'CASH' ? '#4ade80' : tab === 'NON_CASH' ? '#60a5fa' : '#f87171'
            }}
          />
          <button
            onClick={() => handleTabChange("CASH")}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === "CASH"
                ? `text-green-400 ${isDragging ? '' : 'border-b-2 border-green-400'} bg-green-500/5`
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Wallet size={18} />
            Tunai
          </button>
          <button
            onClick={() => handleTabChange("NON_CASH")}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === "NON_CASH"
                ? `text-blue-400 ${isDragging ? '' : 'border-b-2 border-blue-400'} bg-blue-500/5`
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Smartphone size={18} />
            Non-Tunai
          </button>
          <button
            onClick={() => handleTabChange("KREDIT")}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === "KREDIT"
                ? `text-red-400 ${isDragging ? '' : 'border-b-2 border-red-400'} bg-red-500/5`
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Users size={18} />
            Piutang
          </button>
        </div>

        {/* Total Display */}
        <div className="p-6">
          <div className="bg-[#0f172a] rounded-3xl p-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
            <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">
              Total Tagihan
            </div>
            <div className="text-5xl font-black text-white">
              {formatCurrency(total)}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <div className="text-8xl font-black">POS</div>
            </div>
          </div>
        </div>

        {/* Fee & Discount Summary */}
        {(totalDiscount > 0 || feeAmount > 0 || customer) && (
          <div className="px-6 mb-6">
            <div className="bg-slate-800/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-400">Diskon</span>
                  <span className="text-orange-400">
                    -{formatCurrency(totalDiscount)}
                  </span>
                </div>
              )}
              {feeAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">{additionalFee?.name}</span>
                  <span className="text-blue-400">
                    +{formatCurrency(feeAmount)}
                  </span>
                </div>
              )}
              {customer && (
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Pelanggan</span>
                  <span className="text-white">{customer.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold text-center">
            {error}
          </div>
        )}

        {/* Payment Details */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex h-full"
            style={{
              transform: isDragging
                ? `translateX(calc(${-tabIndex * 100}% + ${constrainedSwipeX}px))`
                : `translateX(${-tabIndex * 100}%)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            {...touchHandlers}
          >
            <div className="w-full flex-shrink-0 overflow-y-auto px-6">
              <CashPaymentPanel
                total={total}
                paidAmount={paidAmount}
                customInput={customInput}
                onPresetClick={handlePresetClick}
                onInputChange={(val) => {
                  setCustomInput(val);
                  setPaidAmount(Number(val) || 0);
                }}
              />
            </div>

            <div className="w-full flex-shrink-0 overflow-y-auto px-6">
              <NonCashPaymentPanel
                selectedMethod={selectedNonCashMethod}
                onMethodChange={setSelectedNonCashMethod}
                referenceNumber={referenceNumber}
                onReferenceChange={setReferenceNumber}
              />
            </div>

            <div className="w-full flex-shrink-0 overflow-y-auto px-6">
              <CreditPaymentPanel
                total={total}
                selectedCustomer={selectedCreditCustomer}
                onCustomerSelect={setSelectedCreditCustomer}
                downPayment={downPayment}
                onDownPaymentChange={setDownPayment}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
              />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a] border-t border-slate-800 z-30">
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Kembalian Display - only for CASH tab when paid > total */}
            {tab === "CASH" && paidAmount > total && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex justify-between items-center text-green-400 font-black">
                <span className="uppercase tracking-widest text-sm">
                  Kembalian
                </span>
                <span className="text-2xl tracking-tighter">
                  {formatCurrency(paidAmount - total)}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={
                (tab === "CASH" && paidAmount < total) ||
                (tab === "KREDIT" && !selectedCreditCustomer)
              }
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
            >
              {tab === "CASH" && "Proses Pembayaran"}
              {tab === "NON_CASH" && "Proses Pembayaran"}
              {tab === "KREDIT" && "Simpan Piutang"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Exit Dialog */}
      <ConfirmDialog
        isOpen={showConfirmExit}
        onClose={() => setShowConfirmExit(false)}
        onConfirm={handleConfirmExit}
        title="Batalkan Pembayaran?"
        message="Anda akan kembali ke halaman transaksi. Keranjang masih tersimpan."
        confirmText="Ya, Kembali"
        cancelText="Batal"
        variant="warning"
      />
    </>
  );
}
