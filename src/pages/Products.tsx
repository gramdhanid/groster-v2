import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Package,
  AlertCircle,
  Camera,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
import { formatCurrency } from "../utils/format";
import ProductModal from "../components/products/ProductModal";
import StockAdjustmentModal from "../components/products/StockAdjustmentModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SwipeableProductCard from "../components/products/SwipeableProductCard";
import BarcodeScanner from "../components/products/BarcodeScanner";
import ProductFilterModal from "../components/filters/ProductFilterModal";
import SortModal, { type SortOptionValue } from "../components/filters/SortModal";

import type { Product } from "../types/product";
import { PRODUCT_CATEGORIES } from "../types/product";
import type { ProductFilters } from "../types/filter";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Indomie Goreng",
    category: "Sembako",
    barcode: "089686043130",
    stock_qty: 120,
    units: [
      {
        id: "u1",
        unit_type: "Pcs",
        price_sell: 3500,
        price_cost: 3000,
        qty_per_base_unit: 1,
        is_default: true,
      },
      {
        id: "u2",
        unit_type: "Dus",
        price_sell: 135000,
        price_cost: 120000,
        qty_per_base_unit: 40,
        is_default: false,
      },
    ],
  },
  {
    id: "2",
    name: "Teh Pucuk Harum 350ml",
    category: "Minuman",
    barcode: "8996001416187",
    stock_qty: 8,
    units: [
      {
        id: "u3",
        unit_type: "Botol",
        price_sell: 4000,
        price_cost: 3200,
        qty_per_base_unit: 1,
        is_default: true,
      },
    ],
  },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 1000000],
    stockFilter: "all",
  });

  // Sort state
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOptionValue>("name-asc");

  // Calculate price bounds from products
  const priceBounds = useMemo(() => {
    const prices = products.flatMap((p) => p.units.map((u) => u.price_sell));
    return {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 1000000,
    };
  }, [products]);

  // Calculate top 3 categories for quick filter chips
  const top3Categories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
  }, [products]);

  // Initialize price range on mount
  useMemo(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [priceBounds.min, priceBounds.max],
    }));
  }, [priceBounds.min, priceBounds.max]);

  // Barcode not found dialog states
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  // Request camera permission before opening scanner modal
  const handleOpenScanner = async () => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Camera API not available");
        setIsScannerOpen(true);
        return;
      }

      // Pre-request camera permission to trigger prompt
      // This ensures permission is granted before scanner initializes
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Immediately stop the stream - we just needed the permission
      stream.getTracks().forEach((track) => track.stop());

      // Now open the scanner
      setIsScannerOpen(true);
    } catch (err) {
      // If permission denied or error, still open scanner to show error message
      console.debug("Camera permission check:", err);
      setIsScannerOpen(true);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search);

      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(p.category);

      const matchesPrice = p.units.some(
        (u) =>
          u.price_sell >= filters.priceRange[0] &&
          u.price_sell <= filters.priceRange[1],
      );

      const matchesStock =
        filters.stockFilter === "all" ||
        (filters.stockFilter === "low" && p.stock_qty < 100) ||
        (filters.stockFilter === "medium" &&
          p.stock_qty >= 100 &&
          p.stock_qty <= 200) ||
        (filters.stockFilter === "high" && p.stock_qty > 200);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      // Get default price for sorting
      const getPrice = (p: Product) => {
        const defaultUnit = p.units.find((u) => u.is_default);
        return defaultUnit ? defaultUnit.price_sell : p.units[0].price_sell;
      };

      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "id-ID");
        case "name-desc":
          return b.name.localeCompare(a.name, "id-ID");
        case "price-asc":
          return getPrice(a) - getPrice(b);
        case "price-desc":
          return getPrice(b) - getPrice(a);
        case "stock-asc":
          return a.stock_qty - b.stock_qty;
        case "stock-desc":
          return b.stock_qty - a.stock_qty;
        default:
          return 0;
      }
    });

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

  // Quick category filter - toggles category
  const handleQuickCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Quick stock filter - sets stock level
  const handleQuickStockFilter = (level: "all" | "low" | "medium" | "high") => {
    setFilters((prev) => ({
      ...prev,
      stockFilter: prev.stockFilter === level ? "all" : level,
    }));
  };

  // Remove single category
  const handleRemoveCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [priceBounds.min, priceBounds.max],
      stockFilter: "all",
    });
  };

  const handleSaveProduct = (productData: Product) => {
    if (selectedProduct) {
      setProducts(
        products.map((p) => (p.id === productData.id ? productData : p)),
      );
    } else {
      setProducts([...products, productData]);
    }
  };

  const handleUpdateStock = (id: string, newQty: number) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, stock_qty: newQty } : p)),
    );
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (id?: string) => {
    const productId = id ?? productToDelete;
    if (productId) {
      setProducts(products.filter((p) => p.id !== productId));
      setProductToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenStock = (product: Product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    // Check if product with this barcode exists
    const existingProduct = products.find((p) => p.barcode === barcode);

    if (existingProduct) {
      // Product found - just show it in search
      setSearch(barcode);
    } else {
      // Product not found - show dialog to add new product
      setScannedBarcode(barcode);
      setShowAddProductDialog(true);
    }
  };

  const handleAddProductFromBarcode = () => {
    // Close dialog and open ProductModal with pre-filled barcode
    setShowAddProductDialog(false);

    // Create a partial product object with barcode only
    // ProductModal will fill in default values for missing fields
    const partialProduct: Product = {
      id: crypto.randomUUID(),
      name: "",
      category: PRODUCT_CATEGORIES[0],
      barcode: scannedBarcode || "",
      stock_qty: 0,
      units: [
        {
          id: crypto.randomUUID(),
          unit_type: "Pcs",
          price_sell: 0,
          price_cost: 0,
          qty_per_base_unit: 1,
          is_default: true,
        },
      ],
    };

    setSelectedProduct(partialProduct);
    setIsProductModalOpen(true);
  };

  const handleCancelAddProduct = () => {
    // Just show the barcode in search for manual lookup
    setShowAddProductDialog(false);
    setSearch(scannedBarcode || "");
    setScannedBarcode(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 pt-6">
        <h1 className="text-3xl font-bold text-white">Daftar Produk</h1>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama atau barcode..."
            className="w-full pl-10 pr-12 py-3 bg-[#0f172a] border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm text-white placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={handleOpenScanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Scan barcode dengan kamera"
          >
            <Camera size={20} />
          </button>
        </div>

        {/* Filter Chips Bar - Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Quick Category Chips - Top 3 categories */}
          {top3Categories.map((category) => (
            <button
              key={category}
              onClick={() => handleQuickCategoryFilter(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.categories.includes(category)
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {category}
            </button>
          ))}

          {/* Stock Quick Filter */}
          <button
            onClick={() => handleQuickStockFilter("low")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.stockFilter === "low"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <AlertCircle size={14} />
            <span>Stock Menipis</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700 flex-shrink-0" />

          {/* Sort Button */}
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
          >
            <ArrowUpDown size={14} />
            <span>Urutkan</span>
          </button>

          {/* Advanced Filter Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              getActiveFilterCount(filters) > 0
                ? "bg-primary text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <Filter size={14} />
            {getActiveFilterCount(filters) > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount(filters)}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display - Show dismissible chips */}
        {getActiveFilterCount(filters) > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleRemoveCategory(cat)}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30"
              >
                {cat}
                <X size={12} />
              </button>
            ))}
            {filters.stockFilter !== "all" && filters.stockFilter !== "low" && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, stockFilter: "all" }))}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30"
              >
                {filters.stockFilter === "medium" ? "Stok Sedang" : "Stok Tinggi"}
                <X size={12} />
              </button>
            )}
            <button
              onClick={handleClearAllFilters}
              className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Reset semua
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              Tidak ada produk
            </h3>
            <p className="text-sm text-slate-500">
              {search ||
              filters.categories.length > 0 ||
              filters.stockFilter !== "all"
                ? "Tidak ada produk yang sesuai dengan pencarian atau filter Anda."
                : "Mulai dengan menambahkan produk baru."}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <SwipeableProductCard
              key={product.id}
              onDelete={() => handleDeleteClick(product.id)}
            >
              <div className="bg-[#0f172a] p-4 shadow-sm border border-slate-800 flex flex-col gap-3 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {product.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.stock_qty < 10
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : product.stock_qty < 50
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {product.stock_qty < 10 && <AlertCircle size={14} />}
                    Stok: {product.stock_qty}
                  </div>
                </div>

                <div className="space-y-2">
                  {product.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-lg border border-slate-800"
                    >
                      <span className="font-medium text-slate-300">
                        {unit.unit_type}{" "}
                        {unit.is_default && (
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded ml-1">
                            Default
                          </span>
                        )}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {formatCurrency(unit.price_sell)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Modal: {formatCurrency(unit.price_cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleOpenStock(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg border border-primary/20 transition-colors"
                  >
                    <Package size={16} /> Stok
                  </button>
                </div>
              </div>
            </SwipeableProductCard>
          ))
        )}
      </div>

      <button
        onClick={handleOpenAdd}
        className="fixed bottom-24 right-4 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 shadow-primary/40"
      >
        <Plus size={36} />
      </button>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
          setScannedBarcode(null);
        }}
        onSave={handleSaveProduct}
        initialData={selectedProduct}
      />

      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleUpdateStock}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk?"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showAddProductDialog}
        onClose={handleCancelAddProduct}
        onConfirm={handleAddProductFromBarcode}
        title="Barcode Tidak Ditemukan"
        message={`Produk dengan barcode "${scannedBarcode || ""}" belum ada. Apakah Anda ingin menambahkan produk baru?`}
        confirmText="+ Tambah Produk"
        cancelText="Cari Manual"
        variant="info"
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <ProductFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
        products={products}
        allCategories={[...PRODUCT_CATEGORIES]}
      />

      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onSortSelect={setSortBy}
        currentSort={sortBy}
      />
    </div>
  );
}
