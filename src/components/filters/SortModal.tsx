import { X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

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
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  const handleSortSelect = (sortBy: SortOptionValue) => {
    onSortSelect(sortBy);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tight">Urutkan Produk</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`
                  w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-left
                  ${
                    currentSort === option.value
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
