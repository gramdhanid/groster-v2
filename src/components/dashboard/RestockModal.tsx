import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Package, MessageCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';
import type { RestockModalProps, RestockOrderItem } from '@/types/restock';

export default function RestockModal({
  isOpen,
  onClose,
  lowStockItems,
  suppliers,
  selectedProductId,
}: RestockModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<RestockOrderItem[]>([]);

  // Swipe-to-dismiss states
  const [dragStartY, setDragStartY] = useState(0);
  const [currentDragY, setCurrentDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [canPullToDismiss, setCanPullToDismiss] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

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
      setSelectedSupplierId('');
    }
  }, [isOpen, lowStockItems, selectedProductId]);

  // Real-time total calculation
  const totalCost = useMemo(() => {
    return orderItems
      .filter((item) => item.selected)
      .reduce(
        (sum, item) => sum + item.quantity * item.lastPurchasePrice,
        0
      );
  }, [orderItems]);

  const selectedCount = orderItems.filter((item) => item.selected).length;

  // Swipe-to-dismiss handlers
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Hanya izinkan drag jika di posisi paling atas konten
    if (!canPullToDismiss) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setIsDragging(true);
  }, [canPullToDismiss]);

  const handleDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;

    // Hanya izinkan drag ke bawah (deltaY positif)
    if (deltaY > 0) {
      setCurrentDragY(deltaY);
    }
  }, [isDragging, dragStartY]);

  const handleDragEnd = useCallback(() => {
    // Jika drag melebihi threshold (150px), tutup modal
    if (currentDragY > 150) {
      onClose();
    } else {
      // Kembalikan ke posisi semula
      setCurrentDragY(0);
    }
    setIsDragging(false);
  }, [currentDragY, onClose]);

  // Reset drag state ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentDragY(0);
      setIsDragging(false);
      setDragStartY(0);
      setCanPullToDismiss(true);
    }
  }, [isOpen]);

  // Handle scroll pada content untuk smart scroll behavior
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;

    // Hanya izinkan pull-to-dismiss jika di posisi paling atas
    setCanPullToDismiss(scrollTop === 0);
  }, []);

  // Handlers
  const handleToggleItem = (productId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleSendWhatsApp = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const selectedItems = orderItems.filter((item) => item.selected);

    // Format message
    const message = `Hallo Pak ${supplier.supplierName}, ingin pesan ulang barang berikut:

${selectedItems
  .map((item, index) => `${index + 1}. ${item.productName} - ${item.quantity} pcs`)
  .join('\n')}

Total Estimasi : ${formatCurrency(totalCost)}

Mohon dikonfirmasi ketersediaan dan ongkos kirimnya.
Terima kasih.`;

    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${supplier.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    onClose();
  };

  const isValid = selectedSupplierId && selectedCount > 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: currentDragY > 0 ? `translateY(${currentDragY}px)` : 'translateY(0)',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Handle Indicator */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Package className="text-primary" size={20} />
            <h2 className="text-xl font-black tracking-tight">Restock Order</h2>
            {selectedCount > 0 && (
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          ref={contentRef}
          className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0"
          onScroll={handleScroll}
        >
          {/* Supplier Selection */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Pilih Supplier
            </h3>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
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
              <span className="text-xs text-slate-500">
                {selectedCount} / {orderItems.length} selected
              </span>
            </div>

            <div className="space-y-2">
              {orderItems.map((item) => (
                <div
                  key={item.productId}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    item.selected
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
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
                          parseInt(e.target.value) || 0
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
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-4 flex-shrink-0">
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
        </div>
      </div>
    </div>
  );
}
