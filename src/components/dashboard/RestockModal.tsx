import { useState, useMemo, useEffect } from "react";
import { Package, MessageCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
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

    onClose();
  };

  const isValid = selectedSupplierId && selectedCount > 0;

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Order"
      icon={<Package size={20} />}
      size="md"
      bodyClassName="p-6"
      footer={
        <>
          {/* Order Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total Estimasi:</span>
            <span className="text-2xl font-black text-primary">
              {formatCurrency(totalCost)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 border-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={!isValid}
              className="flex-1 py-3.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Send via WhatsApp
            </Button>
          </div>
        </>
      }
    >
      {/* Supplier Selection */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Pilih Supplier
        </h3>
        <Select
          value={selectedSupplierId}
          onValueChange={setSelectedSupplierId}
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
            Items to Restock
          </h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              selectedCount > 0
                ? "bg-primary/20 text-primary"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {selectedCount} / {orderItems.length} selected
          </span>
        </div>

        <div className="space-y-2">
          {orderItems.map((item) => (
            <div
              key={item.productId}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.selected
                  ? "bg-primary/5 border-primary/20"
                  : "bg-slate-900/50 border-slate-800 opacity-60"
              }`}
            >
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => handleToggleItem(item.productId)}
                className="border-slate-600"
              />

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">
                  {item.productName}
                </div>
                <div className="text-xs text-slate-500">
                  Stock: {item.currentStock} / Min: {item.minimumStock}
                </div>
                <div className="text-xs text-primary">
                  {formatCurrency(item.lastPurchasePrice)} / pcs
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.productId,
                      parseInt(e.target.value) || 0,
                    )
                  }
                  disabled={!item.selected}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                />
                <span className="text-xs text-slate-500">pcs</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </BottomSheetModal>
  );
}
