import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import type { ModalButton } from "@/components/ui/BottomSheetModal";

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

  const secondaryButton: ModalButton = {
    label: "Batal",
    onClick: () => onClose(localSelected),
  };

  const primaryButton: ModalButton = {
    label: `Pilih ${localSelected.length} Kategori`,
    onClick: handleApply,
    disabled: localSelected.length === 0,
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={() => onClose(localSelected)}
      title="Pilih Kategori"
      size="md"
      secondaryButton={secondaryButton}
      primaryButton={primaryButton}
      bodyClassName={"p-6"}
    >
      {/* Search */}
      <div className="pb-4">
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

      {/* Select All Button | Reset Pilihan */}
      <div className="flex justify-between items-center pb-3">
        <button
          onClick={handleSelectAll}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {localSelected.length === allCategories.length
            ? "Batal Pilih Semua"
            : "Pilih Semua"}
        </button>
        {localSelected.length > 0 && (
          <button
            onClick={handleReset}
            className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
          >
            Reset {localSelected.length} Pilihan
          </button>
        )}
      </div>

      {/* Category List */}
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
          </label>
        ))}

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            Tidak ada kategori yang cocok
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}
