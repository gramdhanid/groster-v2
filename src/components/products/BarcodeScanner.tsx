import { useEffect, useRef, useState } from "react";
import { X, Loader, CameraOff, Flashlight } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

// Scanner instance ID - must be unique
const SCANNER_ID = "barcode-scanner";

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  // DOM container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Scanner instance ref
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Camera ID ref for torch control
  const cameraIdRef = useRef<string | null>(null);

  // Guards against double-initialization (React StrictMode)
  const isInitializedRef = useRef(false);
  const isCleaningUpRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Cleanup function - ensures camera is released
  const cleanupScanner = async () => {
    if (isCleaningUpRef.current || !scannerRef.current) return;

    isCleaningUpRef.current = true;

    try {
      // Check if scanner is currently scanning
      const isScanning = scannerRef.current.isScanning;
      if (isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.debug("Scanner stop error (expected during cleanup):", err);
    } finally {
      // Clear the scanner instance
      scannerRef.current = null;
      cameraIdRef.current = null;
      isInitializedRef.current = false;
      isCleaningUpRef.current = false;
      setCameraActive(false);
      setTorchOn(false);
      setTorchAvailable(false);
    }
  };

  // Toggle torch/flash
  const toggleTorch = async () => {
    if (!scannerRef.current) return;

    try {
      const newState = !torchOn;

      // Get the video element and apply torch constraint
      const videoElement = document.querySelector(`#${SCANNER_ID} video`) as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getVideoTracks();
        if (tracks.length > 0) {
          await tracks[0].applyConstraints({
            advanced: [{ torch: newState }] as any,
          });
          setTorchOn(newState);
        }
      }
    } catch (err) {
      console.debug("Torch toggle error:", err);
      // Torch might not be supported on this device
      setTorchAvailable(false);
    }
  };

  useEffect(() => {
    // Skip if modal closed, already cleaning up, or already initialized
    if (!isOpen || isCleaningUpRef.current || isInitializedRef.current) {
      return;
    }

    // Reset states
    setIsLoading(true);
    setError(null);
    setCameraActive(false);
    setTorchOn(false);
    setTorchAvailable(false);

    // Small delay to ensure DOM element exists and is rendered
    const initTimer = setTimeout(async () => {
      // Double-check container exists and we're not already initialized
      if (
        !containerRef.current ||
        isInitializedRef.current ||
        isCleaningUpRef.current
      ) {
        setIsLoading(false);
        return;
      }

      // Initialize scanner
      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;
      isInitializedRef.current = true;

      // Scan success callback
      const onScanSuccess = (decodedText: string) => {
        // Stop scanner, call callback, and close modal
        cleanupScanner();
        onScan(decodedText);
        onClose();
      };

      // Scan error callback - most errors are harmless during scanning
      const onScanError = (error: unknown) => {
        // Silently ignore scan errors - normal operation
        // Only log in development for debugging
        if (import.meta.env.DEV) {
          console.debug("Scan error:", error);
        }
      };

      // Camera config - prefer back camera with torch capability
      const cameraConfig = {
        facingMode: { exact: "environment" },
      };

      // Scanner config - optimized for 1D barcodes (EAN, UPC, Code128)
      // Only process common product barcode formats for better performance
      const scannerConfig = {
        fps: 10,
        qrbox: { width: 300, height: 150 }, // Wider for 1D barcodes
        aspectRatio: 2.0, // Wider aspect ratio for barcodes
        // Focus on product barcode formats only - faster & more accurate
        formatsToSupport: [
          0, // QR_CODE (just in case)
          1, // AZTEC
          2, // CODABAR
          3, // CODE_39
          4, // CODE_93
          5, // CODE_128
          6, // DATA_MATRIX
          7, // EAN_8
          8, // EAN_13
          9, // ITF
          10, // MAXICODE
          11, // PDF_417
          12, // UPC_A
          13, // UPC_E
          14, // RMQR
        ],
      };

      try {
        // Get available cameras first to check for torch capability
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Find back camera
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment") ||
            d.label.toLowerCase().includes("rear")
          ) || devices[0];

          cameraIdRef.current = backCamera.id;

          // Check if torch is available (some devices don't support it)
          // We'll update this after camera starts
        }

        // Start the scanner with explicit camera ID
        await html5QrCode.start(
          cameraIdRef.current ? { deviceId: { exact: cameraIdRef.current } } : cameraConfig,
          scannerConfig,
          onScanSuccess,
          onScanError,
        );

        // Check torch availability after camera starts
        try {
          const capabilities = (navigator.mediaDevices as any).getSupportedConstraints?.();
          if (capabilities?.torch) {
            setTorchAvailable(true);
          }
        } catch {
          // Torch check failed, device might not support it
          setTorchAvailable(false);
        }

        setCameraActive(true);
        setIsLoading(false);
        setError(null);
      } catch (err: unknown) {
        // Handle specific error types
        let errorMsg = "Gagal mengakses kamera.";

        if (err instanceof Error) {
          const message = err.message.toLowerCase();

          // Check for permission denied
          if (
            message.includes("permission") ||
            message.includes("denied") ||
            message.includes("not allowed")
          ) {
            errorMsg =
              "Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.";
          }
          // Check for no camera found
          else if (
            message.includes("not found") ||
            message.includes("no device") ||
            message.includes("could not find")
          ) {
            errorMsg = "Tidak ada kamera yang ditemukan pada perangkat ini.";
          }
          // Check for HTTPS requirement
          else if (message.includes("https") || message.includes("secure")) {
            errorMsg =
              "Akses kamera memerlukan HTTPS (atau localhost untuk pengembangan).";
          }
          // Generic error with message
          else {
            errorMsg = `Gagal mengakses kamera: ${err.message}`;
          }
        }

        setError(errorMsg);
        setIsLoading(false);
        setCameraActive(false);
        isInitializedRef.current = false;

        console.error("Scanner initialization error:", err);
      }
    }, 150); // 150ms delay for DOM ready

    // Cleanup on unmount or modal close
    return () => {
      clearTimeout(initTimer);
      cleanupScanner();
    };
  }, [isOpen, onClose, onScan]);

  // Additional cleanup when modal closes
  useEffect(() => {
    if (!isOpen && scannerRef.current) {
      cleanupScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Tutup scanner"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Scan Barcode</h2>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader className="animate-spin text-primary" size={32} />
            <p className="text-sm text-slate-400 mt-3">Mengakses kamera...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CameraOff className="text-red-400 shrink-0" size={20} />
              <div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
                <p className="text-xs text-red-400/70 mt-1">
                  Pastikan Anda mengizinkan akses kamera dan menggunakan HTTPS
                  atau localhost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        <div className="relative">
          <div
            ref={containerRef}
            id={SCANNER_ID}
            className="w-full rounded-lg overflow-hidden bg-slate-800 min-h-[200px]"
          />

          {/* Flash/Torch Toggle Button */}
          {cameraActive && torchAvailable && (
            <button
              onClick={toggleTorch}
              className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${
                torchOn
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/50"
                  : "bg-slate-800/80 text-white backdrop-blur-sm"
              }`}
              aria-label={torchOn ? "Matikan flash" : "Hidupkan flash"}
            >
              <Flashlight size={20} />
            </button>
          )}
        </div>

        {cameraActive && (
          <p className="text-xs text-slate-400 text-center mt-4">
            Arahkan kamera ke barcode produk. Pastikan pencahayaan cukup.
          </p>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400">
            <strong className="text-slate-300">Tips:</strong> Jika barcode tidak
            terdeteksi, coba:
          </p>
          <ul className="text-xs text-slate-500 mt-1 space-y-1 pl-4 list-disc">
            <li>Perbaiki pencahayaan atau gunakan flash</li>
            <li>Jarak 10-15cm dari barcode</li>
            <li>Pastikan barcode tidak blur</li>
            <li>Input manual melalui kolom pencarian</li>
          </ul>
        </div>

        {/* Debug info for development */}
        {error && import.meta.env.DEV && (
          <details className="mt-4 text-xs text-slate-500">
            <summary className="cursor-pointer hover:text-slate-400">
              Debug info (dev only)
            </summary>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>Scanner ID: {SCANNER_ID}</li>
              <li>DOM exists: {containerRef.current ? "Yes" : "No"}</li>
              <li>
                Camera API:{" "}
                {typeof navigator.mediaDevices?.getUserMedia === "function"
                  ? "Available"
                  : "Not available"}
              </li>
              <li>Torch available: {torchAvailable ? "Yes" : "No"}</li>
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
