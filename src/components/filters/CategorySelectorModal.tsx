import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: (selectedCategories: string[]) => void;
  allCategories: string[];
  selectedCategories: string[];
}

export default function CategorySelectorModal({
  isOpen,
  onClose,
  allCategories,
  selectedCategories,
}: CategorySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState(selectedCategories);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return allCategories;
    return allCategories.filter((cat) =>
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allCategories, searchQuery]);

  const handleToggle = (category: string) => {
    setLocalSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setLocalSelected([]);
  };

  const handleApply = () => {
    onClose(localSelected);
  };

  const handleSelectAll = () => {
    if (localSelected.length === allCategories.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected([...allCategories]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => onClose(localSelected)}
    >
      <div
        className="bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-black tracking-tight">Pilih Kategori</h2>
          <button
            onClick={() => onClose(localSelected)}
            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Select All Button */}
        <div className="px-6 pb-3 flex-shrink-0">
          <button
            onClick={handleSelectAll}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            {localSelected.length === allCategories.length
              ? "Deselect Semua"
              : "Pilih Semua"}
          </button>
        </div>

        {/* Category List */}
        <div className="px-6 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-1 pb-4">
            {filteredCategories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={localSelected.includes(category)}
                  onCheckedChange={() => handleToggle(category)}
                  className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="flex-1 text-sm font-medium">{category}</span>
                {localSelected.includes(category) && (
                  <Check size={16} className="text-primary flex-shrink-0" />
                )}
              </label>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              Tidak ada kategori yang cocok
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 space-y-3 border-t border-slate-800 flex-shrink-0">
          {localSelected.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Reset Pilihan
            </button>
          )}

          <button
            onClick={handleApply}
            className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Pilih {localSelected.length} Kategori
          </button>
        </div>
      </div>
    </div>
  );
}
