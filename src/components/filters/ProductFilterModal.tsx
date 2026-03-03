import { useState, useMemo } from "react";
import { X, Filter, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import CategorySelectorModal from "./CategorySelectorModal";
import type { ProductFilters, StockFilterOption } from "@/types/filter";
import type { Product } from "@/types/product";

const STOCK_FILTERS: StockFilterOption[] = [
  {
    value: "all",
    label: "Semua",
    description: "Tampilkan semua produk",
    color: "bg-slate-700",
    showRing: true,
  },
  {
    value: "low",
    label: "< 100",
    description: "Stok rendah",
    color: "bg-red-500/20 border-red-500/30 text-red-400",
    showRing: false,
  },
  {
    value: "medium",
    label: "100-200",
    description: "Stok sedang",
    color: "bg-orange-500/20 border-orange-500/30 text-orange-400",
    showRing: false,
  },
  {
    value: "high",
    label: "> 200",
    description: "Stok tinggi",
    color: "bg-green-500/20 border-green-500/30 text-green-400",
    showRing: true,
  },
];

interface ProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  currentFilters: ProductFilters;
  products: Product[];
  allCategories: string[];
}
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  // Delay for keyboard animation to complete
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
};

const formatNumber = (num: number) => {
  return num.toLocaleString("id-ID");
};

export default function ProductFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  products,
  allCategories,
}: ProductFilterModalProps) {
  // Local state for unsaved changes
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Calculate top 5 categories
  const topCategories = useMemo(() => {
    const counts = products.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);
  }, [products]);

  // Calculate price range from products
  const priceBounds = useMemo(() => {
    const prices = products.flatMap((p) => p.units.map((u) => u.price_sell));
    return {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 1000000,
    };
  }, [products]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      categories: [],
      priceRange: [priceBounds.min, priceBounds.max],
      stockFilter: "all",
    });
  };

  const handleCategoryToggle = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const getActiveFilterCount = (filters: ProductFilters): number => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (
      filters.priceRange[0] > priceBounds.min ||
      filters.priceRange[1] < priceBounds.max
    )
      count++;
    if (filters.stockFilter !== "all") count++;
    return count;
  };

  if (!isOpen) return null;

  const activeFilterCount = getActiveFilterCount(localFilters);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Filter className="text-primary" size={20} />
            <h2 className="text-xl font-black tracking-tight">Filter Produk</h2>
            {activeFilterCount > 0 && (
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Category Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Kategori
            </h3>

            {/* Top 5 Categories */}
            <div className="space-y-2 mb-3">
              {topCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={localFilters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="flex-1 text-sm font-medium">{category}</span>
                </label>
              ))}
            </div>

            {/* See More Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full py-3 px-4 bg-slate-800 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              Lihat Semua Kategori
              <ChevronRight size={16} />
            </button>

            {/* Selected Count */}
            {localFilters.categories.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {localFilters.categories.length} kategori dipilih
              </p>
            )}
          </section>

          {/* Price Range Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Rentang Harga
            </h3>

            <div className="px-2 mb-4">
              <Slider
                min={priceBounds.min}
                max={priceBounds.max}
                step={1000}
                value={localFilters.priceRange}
                onValueChange={([min, max]) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    priceRange: [min, max],
                  }))
                }
                className="my-6 [&_[data-radix-slider-track]]:bg-slate-700 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-sm gap-3">
              <div className="flex-1">
                <label className="text-slate-500 text-xs block mb-1">Min</label>
                <input
                  type="text"
                  value={formatNumber(localFilters.priceRange[0])}
                  onFocus={handleFocus}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\./g, "")) || priceBounds.min;
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceRange: [
                        Math.max(
                          priceBounds.min,
                          Math.min(val, localFilters.priceRange[1]),
                        ),
                        localFilters.priceRange[1],
                      ],
                    }));
                  }}
                  className="w-full bg-slate-800 px-3 py-2 rounded-lg text-center font-bold text-sm text-white border border-slate-700 focus:border-primary outline-none"
                />
              </div>
              <span className="text-slate-600 flex-shrink-0 self-center">
                —
              </span>
              <div className="flex-1">
                <label className="text-slate-500 text-xs block mb-1">Max</label>
                <input
                  type="text"
                  value={formatNumber(localFilters.priceRange[1])}
                  onFocus={handleFocus}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\./g, "")) || priceBounds.max;
                    setLocalFilters((prev) => ({
                      ...prev,
                      priceRange: [
                        localFilters.priceRange[0],
                        Math.min(
                          priceBounds.max,
                          Math.max(val, localFilters.priceRange[0]),
                        ),
                      ],
                    }));
                  }}
                  className="w-full bg-slate-800 px-3 py-2 rounded-lg text-center font-bold text-sm text-white border border-slate-700 focus:border-primary outline-none"
                />
              </div>
            </div>
          </section>

          {/* Stock Filter Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Stok
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {STOCK_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      stockFilter: filter.value,
                    }))
                  }
                  className={`
                    py-3 px-4 rounded-xl font-bold text-sm transition-all border
                    ${
                      localFilters.stockFilter === filter.value
                        ? `${filter.color}${filter.showRing ? " ring-2 ring-primary/50" : ""}`
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }
                  `}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 py-3.5 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Terapkan
          </button>
        </div>
      </div>

      {/* Category Selector Modal */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={(categories) => {
          setLocalFilters((prev) => ({ ...prev, categories }));
          setIsCategoryModalOpen(false);
        }}
        allCategories={allCategories}
        selectedCategories={localFilters.categories}
      />
    </div>
  );
}
