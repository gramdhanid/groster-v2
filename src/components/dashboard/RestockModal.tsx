import { useState, useMemo, useEffect } from "react";
import { Package } from "lucide-react";
import type { ModalButton } from "@/components/ui/BottomSheetModal";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { formatCurrency } from "@/utils/format";
import type { RestockModalProps, RestockOrderItem } from "@/types/restock";

export default function RestockModal({
  isOpen,
  onClose,
  lowStockItems,
  suppliers,
  selectedProductId,
}: RestockModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<RestockOrderItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize order items with smart defaults when modal opens
  useEffect(() => {
    if (isOpen && lowStockItems.length > 0) {
      const initialItems = lowStockItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        lastPurchasePrice: item.lastPurchasePrice,
        quantity: Math.max(10, item.minimumStock - item.currentStock),
        selected: item.id === selectedProductId,
      }));

      // Sort items: selected product first, then others
      const sortedItems = initialItems.sort((a, b) => {
        if (a.productId === selectedProductId) return -1;
        if (b.productId === selectedProductId) return 1;
        return 0;
      });

      setOrderItems(sortedItems);
      setSelectedSupplierId("");
      setHasUnsavedChanges(false);
    }
  }, [isOpen, lowStockItems, selectedProductId]);

  // Real-time total calculation
  const totalCost = useMemo(() => {
    return orderItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.quantity * item.lastPurchasePrice, 0);
  }, [orderItems]);

  const selectedCount = orderItems.filter((item) => item.selected).length;

  // Handlers
  const handleToggleItem = (productId: string) => {
    setHasUnsavedChanges(true);
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setHasUnsavedChanges(true);
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(9999, Math.max(0, quantity)) }
          : item,
      ),
    );
  };

  const handleSendWhatsApp = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const selectedItems = orderItems.filter((item) => item.selected);

    // Format message
    const message = `Hallo Pak ${supplier.supplierName}, ingin pesan ulang barang berikut:

${selectedItems
  .map(
    (item, index) => `${index + 1}. ${item.productName} - ${item.quantity} pcs`,
  )
  .join("\n")}

Total Estimasi : ${formatCurrency(totalCost)}

Mohon dikonfirmasi ketersediaan dan ongkos kirimnya.
Terima kasih.`;

    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${supplier.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");

    setHasUnsavedChanges(false);
    onClose();
  };

  const handleSupplierChange = (value: string) => {
    setHasUnsavedChanges(true);
    setSelectedSupplierId(value);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  const isValid = selectedSupplierId && selectedCount > 0;

  const secondaryButton: ModalButton = {
    label: "Batal",
    onClick: handleClose,
  };

  const primaryButton: ModalButton = {
    label: "Kirim WhatsApp",
    onClick: handleSendWhatsApp,
    disabled: !isValid,
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pesanan Restok"
      icon={<Package size={20} />}
      size="md"
      bodyClassName="p-6"
      footerSummary={
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Total Estimasi:</span>
          <span className="text-2xl font-black text-primary">
            {formatCurrency(totalCost)}
          </span>
        </div>
      }
      secondaryButton={secondaryButton}
      primaryButton={primaryButton}
    >
      {/* Supplier Selection */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Pilih Supplier
        </h3>
        <Select
          value={selectedSupplierId}
          onValueChange={handleSupplierChange}
        >
          <SelectTrigger className="bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Pilih supplier..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.supplierName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Items List */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Pesanan
          </h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              selectedCount > 0
                ? "bg-primary/20 text-primary"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {selectedCount} / {orderItems.length} barang dipilih
          </span>
        </div>

        <div className="space-y-2">
          {orderItems.map((item) => (
            <div
              key={item.productId}
              onClick={() => handleToggleItem(item.productId)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                item.selected
                  ? "bg-primary/5 border-primary/20"
                  : "bg-slate-900/50 border-slate-800 opacity-60"
              }`}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => handleToggleItem(item.productId)}
                  className="border-slate-600"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">
                  {item.productName}
                </div>
                <div className="text-xs text-slate-500">
                  Stok: {item.currentStock} / Min: {item.minimumStock}
                </div>
                <div className="text-xs text-primary">
                  {formatCurrency(item.lastPurchasePrice)} / pcs
                </div>
              </div>

              <div
                className="flex flex-col items-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.productId,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={!item.selected}
                    max={9999}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-500">pcs</span>
                </div>
                {item.quantity === 0 && (
                  <span className="text-xs text-red-400">min 1 pcs</span>
                )}
                {item.quantity === 9999 && (
                  <span className="text-xs text-orange-400">max 9999 pcs</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmClose}
        title="Batalkan Perubahan?"
        message="Anda memiliki perubahan pesanan restok yang belum disimpan. Apakah Anda yakin ingin menutup?"
        confirmText="Ya, Tutup"
        cancelText="Batal"
        variant="warning"
      />
    </BottomSheetModal>
  );
}
