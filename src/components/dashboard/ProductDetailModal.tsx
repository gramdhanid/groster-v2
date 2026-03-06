import { Package, PackagePlus } from "lucide-react";
import type { ModalButton } from "@/components/ui/BottomSheetModal";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { Badge } from "@/components/ui/badge";
import type { LowStockProduct } from "@/types/dashboard";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LowStockProduct | null;
  onRestock: (productId: string) => void;
}

/**
 * Product Detail Modal
 * Menampilkan detail produk lengkap dengan bahasa yang mudah dipahami
 * untuk user lansia dan non-teknis.
 */
export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onRestock,
}: ProductDetailModalProps) {
  if (!product) return null;

  const getStatus = () => {
    if (product.currentStock === 0) {
      return {
        label: "Stok Habis",
        className: "bg-red-500/20 text-red-300 border-red-500/30",
      };
    }
    return {
      label: "Stok Menipis",
      className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
  };

  const status = getStatus();
  const stockNeeded = Math.max(0, product.minimumStock - product.currentStock);

  const primaryButton: ModalButton = {
    label: "Restok",
    onClick: () => {
      onRestock(product.id);
      onClose();
    },
    icon: <PackagePlus size={18} />,
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Produk"
      icon={<Package size={20} />}
      size="md"
      bodyClassName="p-6"
      primaryButton={primaryButton}
    >
      <div className="space-y-6">
        {/* Nama Produk */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Nama Produk
          </h3>
          <p className="text-xl font-bold text-white break-words">
            {product.name}
          </p>
        </section>

        {/* Status Stok */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </h3>
          <Badge
            variant={status.label === "Stok Habis" ? "destructive" : "outline"}
            className={`${status.className} text-base px-4 py-2 border min-h-[44px] flex items-center justify-center`}
          >
            {status.label}
          </Badge>
        </section>

        {/* Kategori */}
        {product.category && (
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kategori
            </h3>
            <p className="text-lg text-slate-200">{product.category}</p>
          </section>
        )}

        {/* Informasi Stok */}
        <section className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Informasi Stok
          </h3>
          <div className="space-y-4">
            {/* Stok Saat Ini */}
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Stok Saat Ini</span>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  {product.currentStock}
                </span>
                <span className="text-slate-500 ml-1">unit</span>
              </div>
            </div>

            {/* Stok Minimum */}
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Stok Minimum</span>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  {product.minimumStock}
                </span>
                <span className="text-slate-500 ml-1">unit</span>
              </div>
            </div>

            {/* Kekurangan */}
            {stockNeeded > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-red-400 font-medium">Perlu Restok</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-red-400">
                    +{stockNeeded}
                  </span>
                  <span className="text-slate-500 ml-1">unit</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Barcode */}
        {product.barcode && (
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Barcode
            </h3>
            <p className="text-lg text-slate-200 font-mono">
              {product.barcode}
            </p>
          </section>
        )}
      </div>
    </BottomSheetModal>
  );
}
