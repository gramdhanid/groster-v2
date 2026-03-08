import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import type { ModalButton } from "@/components/ui/BottomSheetModal";
import { PRODUCT_UNITS } from "../../types/product";

interface UnitSelectorModalProps {
  isOpen: boolean;
  onClose: (selectedUnits: string[]) => void;
  existingUnits: string[];
}

export default function UnitSelectorModal({
  isOpen,
  onClose,
  existingUnits,
}: UnitSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [customUnit, setCustomUnit] = useState("");
  const [addedCustomUnits, setAddedCustomUnits] = useState<string[]>([]);

  // Available predefined units (excluding existing ones)
  const availableUnits = useMemo(() => {
    return PRODUCT_UNITS.filter(
      (unit) => !existingUnits.includes(unit.name) && unit.name !== "Pcs"
    );
  }, [existingUnits]);

  // Filter units based on search
  const filteredUnits = useMemo(() => {
    if (!searchQuery) return availableUnits;
    return availableUnits.filter((unit) =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableUnits, searchQuery]);

  // Check if a custom unit should be shown (not in predefined and not empty)
  const showCustomUnitInList = useMemo(() => {
    return (
      customUnit.trim() &&
      !availableUnits.some(
        (u) => u.name.toLowerCase() === customUnit.trim().toLowerCase()
      )
    );
  }, [customUnit, availableUnits]);

  const handleToggle = (unitName: string) => {
    setLocalSelected((prev) =>
      prev.includes(unitName)
        ? prev.filter((u) => u !== unitName)
        : [...prev, unitName]
    );
  };

  const handleReset = () => {
    setLocalSelected([]);
  };

  const handleApply = () => {
    onClose(localSelected);
  };

  const handleSelectAll = () => {
    const allUnits = filteredUnits.map((u) => u.name) as string[];
    if (allUnits.every((u) => localSelected.includes(u))) {
      // Deselect all filtered
      setLocalSelected((prev) => prev.filter((u) => !allUnits.includes(u)));
    } else {
      // Select all filtered (add new ones, keep existing)
      setLocalSelected((prev) => {
        const combined = [...prev];
        allUnits.forEach((u) => {
          if (!combined.includes(u)) {
            combined.push(u);
          }
        });
        return combined;
      });
    }
  };

  const handleAddCustomUnit = () => {
    const trimmed = customUnit.trim();
    if (trimmed && !localSelected.includes(trimmed)) {
      setLocalSelected([...localSelected, trimmed]);
      setAddedCustomUnits((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );
      setCustomUnit("");
    }
  };

  const handleCustomUnitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomUnit();
    }
  };

  // const allFilteredSelected =
  //   filteredUnits.length > 0 &&
  //   filteredUnits.every((u) => localSelected.includes(u.name));

  const secondaryButton: ModalButton = {
    label: "Batal",
    onClick: () => onClose([]),
  };

  const primaryButton: ModalButton = {
    label: `Pilih ${localSelected.length} Satuan`,
    onClick: handleApply,
    disabled: localSelected.length === 0,
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={() => onClose([])}
      title="Pilih Satuan"
      size="md"
      bodyClassName="p-6"
      secondaryButton={secondaryButton}
      primaryButton={primaryButton}
    >
      {/* Search */}
      <div className="pb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari satuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-slate-600 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Select All Button */}
      {/*<div className="pb-3">*/}
      {/*  <button*/}
      {/*    onClick={handleSelectAll}*/}
      {/*    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"*/}
      {/*  >*/}
      {/*    {allFilteredSelected ? "Batal Pilih Semua" : "Pilih Semua"}*/}
      {/*  </button>*/}
      {/*</div>*/}

      <div className="flex justify-between items-center pb-3">
        <button
            onClick={handleSelectAll}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {localSelected.length === filteredUnits.length
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

      {/* Unit List */}
      <div className="pb-4">
        <div className="grid grid-rows-2">
          {filteredUnits.map((unit) => (
            <label
              key={unit.id}
              className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
            >
              <Checkbox
                checked={localSelected.includes(unit.name)}
                onCheckedChange={() => handleToggle(unit.name)}
                className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="flex-1 text font-medium">{unit.name}</span>
            </label>
          ))}

          {/* Custom Units */}
          {addedCustomUnits.map((unitName) => (
            <label
              key={`custom-${unitName}`}
              className="flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors"
            >
              <Checkbox
                checked={localSelected.includes(unitName)}
                onCheckedChange={() => handleToggle(unitName)}
                className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="flex-1 text font-medium">{unitName}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                Custom
              </span>
            </label>
          ))}
        </div>

        {filteredUnits.length === 0 && !showCustomUnitInList && addedCustomUnits.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            Tidak ada satuan yang cocok
          </div>
        )}
      </div>

      {/* Custom Unit Input */}
      <div className="py-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Satuan lainnya..."
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            onKeyDown={handleCustomUnitKeyDown}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-primary px-4 py-3 text-white placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleAddCustomUnit}
            disabled={!customUnit.trim()}
            className="px-4 py-3 bg-primary/20 border border-primary/30 text-primary rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/30 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
}
