import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Tag,
  Boxes,
  Barcode,
  Camera,
  DollarSign,
  X,
  Save,
} from "lucide-react";

import type { Product, ProductUnit } from "../types/product";
import { PRODUCT_CATEGORIES } from "../types/product";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import BarcodeScanner from "../components/products/BarcodeScanner";
import UnitSelectorModal from "../components/products/UnitSelectorModal";
import SwipeableProductCard from "../components/products/SwipeableProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [...PRODUCT_CATEGORIES];

export default function AddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [stockQty, setStockQty] = useState<number>(0);
  const [units, setUnits] = useState<ProductUnit[]>([
    {
      id: crypto.randomUUID(),
      unit_type: "Pcs",
      price_sell: 0,
      price_cost: 0,
      qty_per_base_unit: 1,
      is_default: true,
    },
  ]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCategoryWarning, setShowCategoryWarning] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<string>("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);

  // Get existing products from localStorage (if any)
  const getExistingProducts = (): Product[] => {
    try {
      const stored = localStorage.getItem("products");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveProductToStorage = (product: Product) => {
    const existing = getExistingProducts();
    const updated = [...existing, product];
    localStorage.setItem("products", JSON.stringify(updated));
  };

  const handleAddUnit = () => {
    setShowUnitSelector(true);
  };

  const handleRemoveUnit = (id: string) => {
    if (units.length > 1) {
      setUnits(units.filter((u) => u.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const handleSetDefaultUnit = (unitId: string) => {
    const oldDefaultUnit = units.find((u) => u.is_default);
    const newDefaultUnit = units.find((u) => u.id === unitId);

    if (
      oldDefaultUnit &&
      newDefaultUnit &&
      oldDefaultUnit.id !== newDefaultUnit.id
    ) {
      // Convert stock from old default unit to new default unit
      const conversionFactor =
        oldDefaultUnit.qty_per_base_unit / newDefaultUnit.qty_per_base_unit;
      setStockQty((prev) => Math.round(prev * conversionFactor));
    }

    // Update is_default flags
    setUnits(
      units.map((u) => ({
        ...u,
        is_default: u.id === unitId,
      })),
    );
    setHasUnsavedChanges(true);
  };

  const updateUnit = (id: string, field: keyof ProductUnit, value: any) => {
    setUnits(units.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!name || units.some((u) => !u.unit_type || u.price_sell <= 0)) {
      toast.error("Mohon lengkapi semua data produk");
      return;
    }

    setHasUnsavedChanges(false);

    let finalCategory = category;
    if (isCustom) {
      if (!customCategory.trim()) {
        toast.error("Mohon isi nama kategori baru");
        return;
      }
      // Trim and capitalize first letter
      const trimmed = customCategory.trim();
      finalCategory = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

      // Warn if similar to predefined
      const similar = CATEGORIES.find(
        (c) => c.toLowerCase() === trimmed.toLowerCase(),
      );
      if (similar && similar !== finalCategory) {
        setSuggestedCategory(similar);
        setPendingCategory(finalCategory);
        setShowCategoryWarning(true);
        return; // Stop here, wait for dialog
      }
    }
    // Continue if no warning
    completeSaveProduct(finalCategory);
  };

  const completeSaveProduct = (finalCategory: string) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      category: finalCategory,
      barcode: barcode || undefined,
      stock_qty: stockQty,
      units,
    };

    saveProductToStorage(newProduct);
    toast.success(`Produk "${name}" berhasil ditambahkan!`);
    navigate("/products");
  };

  const handleCategoryWarningConfirm = () => {
    setShowCategoryWarning(false);
    // Proceed with suggested category
    completeSaveProduct(suggestedCategory);
  };

  const handleCategoryWarningCancel = () => {
    setShowCategoryWarning(false);
    // Proceed with original input
    completeSaveProduct(pendingCategory);
  };

  const formatNumber = (num: number) => {
    return num === 0 ? "" : num.toLocaleString("id-ID");
  };

  const parseNumber = (str: string) => {
    return Number(str.replace(/\D/g, "")) || 0;
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay for keyboard animation to complete
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
    } else {
      navigate("/products");
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    setHasUnsavedChanges(false);
    navigate("/products");
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Tambah Produk Baru</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-8 max-w-2xl mx-auto">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Tag size={16} /> Data Dasar
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">
                Nama Produk
              </label>
              <input
                type="text"
                value={name}
                onFocus={handleFocus}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Contoh: Indomie Goreng"
                className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">
                Kategori
              </label>
              <Select
                value={category}
                onValueChange={(val) => {
                  setCategory(val);
                  setIsCustom(val === "NEW");
                  setHasUnsavedChanges(true);
                }}
              >
                <SelectTrigger className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="NEW" className="text-primary font-bold">
                    + Kategori Baru
                  </SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Ketik nama kategori baru..."
                    className="w-full bg-primary/5 border border-primary/20 p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold placeholder:text-slate-600 border-dashed"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">
                Barcode
              </label>
              <div className="relative">
                <Barcode
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={barcode}
                  onFocus={handleFocus}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Scan atau ketik manual"
                  className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 pr-12 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                  title="Scan barcode dengan kamera"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">
                Stok Awal
              </label>
              <div className="relative">
                <Boxes
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  onFocus={handleFocus}
                  value={formatNumber(stockQty)}
                  onChange={(e) => {
                    setStockQty(parseNumber(e.target.value));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="0"
                  className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Units & Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <DollarSign size={16} /> Satuan & Harga Jual
            </div>
            <button
              onClick={handleAddUnit}
              className="text-primary font-bold text-xs flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
            >
              <Plus size={14} /> Tambah Satuan
            </button>
          </div>

          <div className="space-y-4">
            {units.map((unit) => (
              <SwipeableProductCard
                key={unit.id}
                onDelete={() => handleRemoveUnit(unit.id)}
                enabled={!unit.is_default}
              >
                <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Nama Satuan
                      </label>
                      <input
                        type="text"
                        value={unit.unit_type}
                        onFocus={handleFocus}
                        onChange={(e) =>
                          updateUnit(unit.id, "unit_type", e.target.value)
                        }
                        placeholder="Pcs, Dus, Karung, dll"
                        className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none font-bold focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Isi per{" "}
                        {units.find((u) => u.is_default)?.unit_type ||
                          "Satuan Dasar"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        disabled={unit.is_default}
                        onFocus={handleFocus}
                        value={formatNumber(unit.qty_per_base_unit)}
                        onChange={(e) =>
                          updateUnit(
                            unit.id,
                            "qty_per_base_unit",
                            parseNumber(e.target.value),
                          )
                        }
                        className={`w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none font-bold focus:border-primary transition-colors ${unit.is_default ? "opacity-50 grayscale" : ""}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Harga Beli (Modal)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          onFocus={handleFocus}
                          value={formatNumber(unit.price_cost)}
                          onChange={(e) =>
                            updateUnit(
                              unit.id,
                              "price_cost",
                              parseNumber(e.target.value),
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 p-3 pl-8 rounded-xl outline-none font-bold text-lg focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Harga Jual
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          onFocus={handleFocus}
                          value={formatNumber(unit.price_sell)}
                          onChange={(e) =>
                            updateUnit(
                              unit.id,
                              "price_sell",
                              parseNumber(e.target.value),
                            )
                          }
                          className="w-full bg-slate-900 border border-primary/50 text-primary p-3 pl-8 rounded-xl outline-none font-black text-lg focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Laba badge and Satuan Utama button - side by side */}
                  {unit.price_sell > 0 && unit.price_cost > 0 && (
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 text-[10px] font-bold">
                        Laba:{" "}
                        {(
                          ((unit.price_sell - unit.price_cost) /
                            unit.price_sell) *
                          100
                        ).toFixed(1)}
                        % ({unit.price_sell - unit.price_cost})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetDefaultUnit(unit.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                          unit.is_default
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        {unit.is_default ? "Satuan Utama" : "Jadikan Utama"}
                      </button>
                    </div>
                  )}

                  {/* Jika belum ada harga, tombol satuan utama tetap muncul sendiri */}
                  {!(unit.price_sell > 0 && unit.price_cost > 0) && (
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetDefaultUnit(unit.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          unit.is_default
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        {unit.is_default ? "Satuan Utama" : "Jadikan Utama"}
                      </button>
                    </div>
                  )}

                  {/* Swipe hint for non-default units */}
                  {!unit.is_default && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 no-swipe">
                      <span className="font-black uppercase tracking-wider">
                        Geser ke kiri untuk hapus
                      </span>
                    </div>
                  )}
                </div>
              </SwipeableProductCard>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-sm border-t border-slate-800 p-4 z-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
          >
            <X size={18} /> Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-colors"
          >
            <Save size={18} /> Simpan Produk
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmClose}
        title="Batalkan Perubahan?"
        message="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup formulir ini?"
        confirmText="Ya, Tutup"
        cancelText="Batal"
        variant="warning"
      />

      {/* Category Similarity Warning Dialog */}
      <ConfirmDialog
        isOpen={showCategoryWarning}
        onClose={handleCategoryWarningCancel}
        onConfirm={handleCategoryWarningConfirm}
        title="Kategori Mirip Ditemukan"
        message={`Kategori "${pendingCategory}" mirip dengan kategori yang sudah ada: "${suggestedCategory}". Gunakan "${suggestedCategory}" saja?`}
        confirmText="Ya, Gunakan"
        cancelText="Tetap Pakai Input"
        variant="info"
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedBarcode) => {
          setBarcode(scannedBarcode);
          setHasUnsavedChanges(true);
        }}
      />

      {/* Unit Selector Modal */}
      <UnitSelectorModal
        isOpen={showUnitSelector}
        onClose={(selectedUnits) => {
          if (selectedUnits.length > 0) {
            const newUnits = selectedUnits.map((unitName) => ({
              id: crypto.randomUUID(),
              unit_type: unitName,
              price_sell: 0,
              price_cost: 0,
              qty_per_base_unit: 1,
              is_default: false,
            }));
            setUnits([...units, ...newUnits]);
            setHasUnsavedChanges(true);
          }
          setShowUnitSelector(false);
        }}
        existingUnits={units.map((u) => u.unit_type)}
      />
    </div>
  );
}
