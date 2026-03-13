import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Pause,
  Search,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Receipt,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { formatCurrency } from "../utils/format";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CartItem from "../components/pos/CartItem";
import FeeModal from "../components/pos/FeeModal";
import CustomerSelector from "../components/pos/CustomerSelector";
import NotesModal from "../components/pos/NotesModal";
import BarcodeScanner from "../components/products/BarcodeScanner";

// Mock products - same as POSModal
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Indomie Goreng",
    category: "Mie & Snack",
    barcode: "089686043130",
    stock_qty: 120,
    units: [
      {
        id: "u1",
        unit_type: "Pcs",
        price_sell: 3500,
        price_cost: 3000,
        qty_per_base_unit: 1,
      },
      {
        id: "u2",
        unit_type: "Dus",
        price_sell: 135000,
        price_cost: 120000,
        qty_per_base_unit: 40,
      },
    ],
  },
  {
    id: "2",
    name: "Teh Pucuk Harum 350ml",
    category: "Minuman",
    barcode: "8996001416187",
    stock_qty: 48,
    units: [
      {
        id: "u3",
        unit_type: "Botol",
        price_sell: 4000,
        price_cost: 3200,
        qty_per_base_unit: 1,
      },
    ],
  },
  {
    id: "3",
    name: "Beras Raja Lele 5kg",
    category: "Sembako",
    barcode: "123456789",
    stock_qty: 10,
    units: [
      {
        id: "u4",
        unit_type: "Karung",
        price_sell: 75000,
        price_cost: 68000,
        qty_per_base_unit: 1,
      },
    ],
  },
  {
    id: "4",
    name: "Gudang Garam Filter 12",
    category: "Rokok & Tembakau",
    barcode: "8999999000123",
    stock_qty: 24,
    units: [
      {
        id: "u5",
        unit_type: "Bungkus",
        price_sell: 25000,
        price_cost: 23500,
        qty_per_base_unit: 1,
      },
    ],
  },
  {
    id: "5",
    name: "Aqua 600ml",
    category: "Minuman",
    barcode: "8997035881358",
    stock_qty: 100,
    units: [
      {
        id: "u6",
        unit_type: "Botol",
        price_sell: 4000,
        price_cost: 3200,
        qty_per_base_unit: 1,
      },
      {
        id: "u7",
        unit_type: "Dus",
        price_sell: 96000,
        price_cost: 76800,
        qty_per_base_unit: 24,
      },
    ],
  },
  {
    id: "6",
    name: "Chitato 68gr",
    category: "Mie & Snack",
    barcode: "8996001600268",
    stock_qty: 50,
    units: [
      {
        id: "u8",
        unit_type: "Pcs",
        price_sell: 10000,
        price_cost: 8500,
        qty_per_base_unit: 1,
      },
    ],
  },
];

const TOP_CATEGORIES = [
  "Semua",
  "Rokok & Tembakau",
  "Minuman",
  "Mie & Snack",
  "Sembako",
];

export default function TransactionPage() {
  const navigate = useNavigate();
  const {
    items,
    addItem,
    updateQty,
    updateUnit,
    removeItem,
    setDiscount,
    setAdditionalFee,
    setNotes,
    setCustomer,
    getTotal,
    getSubtotal,
    getTotalDiscount,
    additionalFee,
    notes,
    customer,
    holdCart,
    heldCarts,
    restoreCart,
    deleteHeldCart,
  } = useCartStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchResults, setSearchResults] = useState<typeof MOCK_PRODUCTS>([]);
  const [isCartExpanded, setIsCartExpanded] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showHoldMenu, setShowHoldMenu] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter products based on search and category
  useEffect(() => {
    const q = search.toLowerCase();
    let filtered = MOCK_PRODUCTS;

    if (q.length > 1) {
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.barcode === q,
      );
    }

    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setSearchResults(filtered);
  }, [search, selectedCategory]);

  const handleExit = () => {
    if (items.length > 0) {
      setShowConfirmExit(true);
    } else {
      navigate("/");
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    navigate("/");
  };

  const handleAddProduct = (productId: string) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      addItem(product, product.units[0], product.stock_qty);
    }
  };

  const handleHoldCart = () => {
    if (items.length === 0) return;
    holdCart();
    setShowHoldMenu(false);
    // Optionally show a toast or notification
  };

  const handleRestoreCart = (heldCartId: string) => {
    restoreCart(heldCartId);
  };

  const handleDeleteHeldCart = (heldCartId: string) => {
    deleteHeldCart(heldCartId);
  };

  const handleOpenScanner = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Camera API not available");
        setIsScannerOpen(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsScannerOpen(true);
    } catch (err) {
      console.debug("Camera permission check:", err);
      setIsScannerOpen(true);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setSearch(barcode);
  };

  // Helper to check if product is in cart
  const isProductInCart = (productId: string) => {
    return items.some((i) => i.product_id === productId);
  };

  // Get quantity for badge
  const getProductQty = (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    return item?.qty || 0;
  };

  // Toggle product selection
  const handleToggleProduct = (productId: string, productName: string) => {
    if (isProductInCart(productId)) {
      // Show confirmation instead of direct remove
      setProductToRemove({ id: productId, name: productName });
    } else {
      handleAddProduct(productId);
    }
  };

  // Confirm removal
  const handleConfirmRemove = () => {
    if (productToRemove) {
      const item = items.find((i) => i.product_id === productToRemove.id);
      if (item) removeItem(item.cart_id);
      setProductToRemove(null);
    }
  };

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const total = getTotal();

  return (
    <>
      <div className="h-screen bg-[#020617] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleExit}
              className="p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-black text-white">Transaksi Baru</h1>
            <div className="relative">
              <button
                onClick={() => setShowHoldMenu(!showHoldMenu)}
                disabled={items.length === 0}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold text-sm flex items-center gap-1 disabled:opacity-30 disabled:grayscale hover:bg-slate-700 transition-colors"
              >
                <Pause size={16} />
                Tahan
              </button>

              {/* Hold Menu Dropdown */}
              {showHoldMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowHoldMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    {heldCarts.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        Tidak ada cart ditahan
                      </div>
                    ) : (
                      heldCarts.map((held) => (
                        <div
                          key={held.id}
                          className="p-3 border-b border-slate-700 last:border-0 hover:bg-slate-800"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500">
                              {new Date(held.timestamp).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRestoreCart(held.id)}
                                className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded"
                              >
                                Pulihkan
                              </button>
                              <button
                                onClick={() => handleDeleteHeldCart(held.id)}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-white font-semibold">
                            {held.items.length} item
                          </div>
                          <div className="text-xs text-slate-400">
                            {held.items.map((i) => i.product_name).join(", ")}
                          </div>
                        </div>
                      ))
                    )}
                    <button
                      onClick={handleHoldCart}
                      className="w-full p-3 bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                      + Hold Cart Saat Ini
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search & Category */}
        <div className="bg-[#0f172a] border-b border-slate-800 px-4 pt-4 pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk / scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-500"
            />
            <button
              onClick={handleOpenScanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Scan barcode dengan kamera"
            >
              <Camera size={20} />
            </button>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {cat.split(" & ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Product Grid */}
          <div className="p-4">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>Tidak ada produk ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((product) => {
                  const inCart = isProductInCart(product.id);
                  const qty = getProductQty(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() =>
                        handleToggleProduct(product.id, product.name)
                      }
                      className={`bg-[#0f172a] border p-3 rounded-xl text-left active:scale-95 transition-all group shadow-sm hover:shadow-md relative ${
                        inCart
                          ? "border-primary/60 bg-primary/5"
                          : "border-slate-800 hover:border-primary/50"
                      }`}
                    >
                      {/* Quantity Badge */}
                      {qty > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                          {qty}
                        </div>
                      )}

                      <div
                        className={`font-bold text-xs line-clamp-2 min-h-[2.5em] transition-colors tracking-tight ${
                          inCart
                            ? "text-primary"
                            : "text-slate-200 group-hover:text-primary"
                        } ${qty > 0 ? "pr-8" : ""}`}
                      >
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {product.stock_qty} {product.units[0].unit_type}
                      </div>
                      <div className="text-sm text-primary font-black mt-2">
                        {formatCurrency(product.units[0].price_sell)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="px-4">
            {/* Cart Header */}
            <button
              onClick={() => setIsCartExpanded(!isCartExpanded)}
              className="w-full flex items-center justify-between py-3 px-4 bg-[#0f172a] border border-slate-800 rounded-t-xl"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                <span className="font-bold text-white">Keranjang</span>
                <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                  {items.length}
                </span>
              </div>
              {isCartExpanded ? (
                <ChevronUp size={20} className="text-slate-400" />
              ) : (
                <ChevronDown size={20} className="text-slate-400" />
              )}
            </button>

            {/* Cart Items */}
            {isCartExpanded && (
              <div className="bg-[#0f172a] border-x border-b border-slate-800 rounded-b-xl p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <ShoppingCart
                      size={48}
                      className="mx-auto mb-3 opacity-20"
                    />
                    <p>Keranjang kosong</p>
                    <p className="text-sm mt-1">Tap produk untuk menambahkan</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const product = MOCK_PRODUCTS.find(
                      (p) => p.id === item.product_id,
                    );
                    return (
                      <CartItem
                        key={item.cart_id}
                        item={item}
                        availableUnits={product?.units || []}
                        onUpdateQty={(qty) => updateQty(item.cart_id, qty)}
                        onUpdateUnit={(unit) => updateUnit(item.cart_id, unit)}
                        onRemove={() => removeItem(item.cart_id)}
                        onSetDiscount={(discount) =>
                          setDiscount(item.cart_id, discount)
                        }
                      />
                    );
                  })
                )}

                {/* Customer, Notes, Fee Buttons */}
                {items.length > 0 && (
                  <div className="flex gap-2 pt-3 border-t border-slate-700 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setShowCustomerSelector(true)}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${
                        customer
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <User size={16} />
                      {customer ? customer.name.split(" ")[0] : "Pelanggan"}
                    </button>
                    <button
                      onClick={() => setShowNotesModal(true)}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${
                        notes
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <FileText size={16} />
                      Catatan
                    </button>
                    <button
                      onClick={() => setShowFeeModal(true)}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${
                        additionalFee
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <Receipt size={16} />
                      Biaya
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Summary - Always visible */}
            {items.length > 0 && (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-400">Diskon</span>
                    <span className="text-orange-400 font-semibold">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                )}
                {additionalFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400">{additionalFee.name}</span>
                    <span className="text-blue-400 font-semibold">
                      +{formatCurrency(additionalFee.amount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Total</span>
                    <span className="text-xl font-black text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Checkout Button */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a] border-t border-slate-800 z-30">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => navigate("/transactions/payment")}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-between px-6"
              >
                <span>BAYAR</span>
                <span>{formatCurrency(total)}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fee Modal */}
      <FeeModal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        onApply={setAdditionalFee}
        currentFee={additionalFee}
      />

      {/* Customer Selector */}
      <CustomerSelector
        isOpen={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onSelect={setCustomer}
        currentCustomer={customer}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onSave={setNotes}
        currentNotes={notes}
      />

      {/* Confirm Exit Dialog */}
      <ConfirmDialog
        isOpen={showConfirmExit}
        onClose={() => setShowConfirmExit(false)}
        onConfirm={handleConfirmExit}
        title="Keluar dari Transaksi?"
        message="Keranjang belum kosong. Yakin ingin keluar dan menghapus semua item?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="warning"
      />

      {/* Confirm Clear Dialog (for future use) */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={() => {
          // Clear cart logic here
          setShowConfirmClear(false);
        }}
        title="Hapus Semua Item?"
        message="Semua item di keranjang akan dihapus."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Confirm Remove Product Dialog */}
      <ConfirmDialog
        isOpen={productToRemove !== null}
        onClose={() => setProductToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Hapus Item?"
        message={`${productToRemove?.name} pada keranjang akan terhapus juga.`}
        confirmText="Setuju"
        cancelText="Batal"
        variant="warning"
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
