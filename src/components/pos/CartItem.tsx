import { useState, useEffect } from "react";
import { Plus, Minus, DollarSign, ChevronDown } from "lucide-react";
import type {
  CartItem as CartItemType,
  ProductUnit,
} from "../../store/useCartStore";
import { formatCurrency } from "@/utils/format.ts";
import SwipeableProductCard from "../products/SwipeableProductCard";
import DiscountModal from "./DiscountModal";

interface CartItemProps {
  item: CartItemType;
  availableUnits: ProductUnit[];
  onUpdateQty: (qty: number) => void;
  onUpdateUnit: (unit: ProductUnit) => void;
  onRemove: () => void;
  onSetDiscount: (discount: CartItemType["discount"]) => void;
}

export default function CartItem({
  item,
  availableUnits,
  onUpdateQty,
  onUpdateUnit,
  onRemove,
  onSetDiscount,
}: CartItemProps) {
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [qtyInput, setQtyInput] = useState(item.qty.toString());

  const handleQtyInputChange = (value: string) => {
    // Allow only numbers
    setQtyInput(value.replace(/[^0-9]/g, ""));
  };

  const handleQtyInputBlur = () => {
    const newQty = parseInt(qtyInput) || 1;
    const validatedQty = Math.max(1, newQty);
    setQtyInput(validatedQty.toString());
    onUpdateQty(validatedQty);
  };

  const handleQtyInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQtyInputBlur();
    }
  };

  useEffect(() => {
    setQtyInput(item.qty.toString());
  }, [item.qty]);

  const baseSubtotal = item.qty * item.unit.price_sell;
  const discountAmount = item.discount
    ? item.discount.type === "percent"
      ? (baseSubtotal * item.discount.value) / 100
      : item.discount.value
    : 0;

  return (
    <>
      <SwipeableProductCard onDelete={onRemove} enabled>
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          {/* Main Content */}
          <div className="p-4">
            {/* Header: Name + Actions */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-100 truncate pr-2">
                  {item.product_name}
                </h4>
                {item.discount?.reason && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    📝 {item.discount.reason}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-black text-lg text-primary">
                  {formatCurrency(item.subtotal)}
                </div>
                {item.discount && (
                  <div className="text-xs text-slate-500 line-through">
                    {formatCurrency(baseSubtotal)}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Unit Selector + Discount Button */}
            <div className="flex gap-2 mb-3">
              {/* Unit Selector */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm font-semibold text-slate-200"
                >
                  <span>{item.unit.unit_type}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showUnitDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showUnitDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    {availableUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          onUpdateUnit(unit);
                          setShowUnitDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm font-semibold transition-colors ${
                          unit.id === item.unit.id
                            ? "bg-primary text-white"
                            : "text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {unit.unit_type} - {formatCurrency(unit.price_sell)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount Button */}
              <button
                onClick={() => setShowDiscountModal(true)}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-all ${
                  item.discount
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                }`}
              >
                <DollarSign size={14} />
                {item.discount
                  ? `${item.discount.type === "percent" ? item.discount.value + "%" : formatCurrency(item.discount.value)}`
                  : "Diskon"}
              </button>
            </div>

            {/* Bottom Row: Quick Qty Presets + Qty Controls */}
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between gap-3 min-w-max">
                {/* Quick Qty Presets - Additive */}
                <div className="flex gap-1">
                  {[5, 10, 15].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onUpdateQty(item.qty + preset)}
                      className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>

                {/* Qty Controls */}
                <div className="flex items-center border border-slate-700 rounded-lg bg-slate-800/30">
                  <button
                    onClick={() => onUpdateQty(Math.max(1, item.qty - 1))}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={qtyInput}
                    onChange={(e) => handleQtyInputChange(e.target.value)}
                    onBlur={handleQtyInputBlur}
                    onKeyDown={handleQtyInputKeyDown}
                    className="w-12 text-center font-bold text-lg text-white bg-transparent outline-none"
                  />
                  <button
                    onClick={() => onUpdateQty(item.qty + 1)}
                    className="p-2 text-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Discount Info */}
            {item.discount && discountAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    Diskon{" "}
                    {item.discount.type === "percent"
                      ? `${item.discount.value}%`
                      : formatCurrency(item.discount.value)}
                  </span>
                  <span className="text-orange-400 font-semibold">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SwipeableProductCard>

      {/* Discount Modal */}
      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onApply={onSetDiscount}
        currentDiscount={item.discount}
        itemName={item.product_name}
        itemSubtotal={baseSubtotal}
      />
    </>
  );
}
