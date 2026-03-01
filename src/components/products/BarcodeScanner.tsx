import { useEffect, useRef, useState } from "react";
import { X, Loader } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    const scanner = new Html5QrcodeScanner(
      "barcode-scanner",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false,
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      // Stop scanner and call the callback
      scanner.clear();
      onScan(decodedText);
      onClose();
    };

    const onScanError = (error: string) => {
      // Ignore errors - scanner will keep trying
      console.debug("Scanner error:", error);
    };

    scanner
      .render(onScanSuccess, onScanError)
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        setError(
          "Gagal mengakses kamera. Pastikan Anda memberikan izin kamera.",
        );
        setIsLoading(false);
        console.error("Scanner error:", err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Scan Barcode</h2>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div
          id="barcode-scanner"
          className="w-full rounded-lg overflow-hidden bg-slate-800"
        />

        <p className="text-xs text-slate-400 text-center mt-4">
          Arahkan kamera ke barcode produk
        </p>
      </div>
    </div>
  );
}
