import { useState, useEffect } from "react";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";

export type SortOptionValue =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";

interface SortOption {
  value: SortOptionValue;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "name-asc", label: "Nama A-Z" },
  { value: "name-desc", label: "Nama Z-A" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "stock-asc", label: "Stok Terendah" },
  { value: "stock-desc", label: "Stok Tertinggi" },
];

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSortSelect: (sortBy: SortOptionValue) => void;
  currentSort: SortOptionValue;
}

export default function SortModal({
  isOpen,
  onClose,
  onSortSelect,
  currentSort,
}: SortModalProps) {
  const [selectedSort, setSelectedSort] = useState<SortOptionValue>(currentSort);

  useEffect(() => {
    setSelectedSort(currentSort);
  }, [isOpen, currentSort]);

  const handleApply = () => {
    onSortSelect(selectedSort);
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Urutkan Produk"
      bodyClassName="p-6"
      size="md"
      primaryButton={{
        label: "Terapkan",
        onClick: handleApply,
      }}
      secondaryButton={{
        label: "Batal",
        onClick: onClose,
      }}
    >
      <div className="space-y-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedSort(option.value)}
            className={`
              w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-left
              ${
                selectedSort === option.value
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </BottomSheetModal>
  );
}
