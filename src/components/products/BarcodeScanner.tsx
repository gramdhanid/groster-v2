import { useEffect, useRef, useState, useCallback } from "react";
import { X, Loader, CameraOff, Flashlight } from "lucide-react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library";

// Type declaration for Native Barcode Detection API
interface DetectedBarcode {
  format: string;
  rawValue: string;
  boundingBox?: DOMRectReadOnly;
  cornerPoints?: { x: number; y: number }[];
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

// Scanner instance ID - must be unique
const SCANNER_ID = "barcode-scanner";

// Detect if mobile device for performance optimization
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// Skip frames on mobile to reduce CPU usage (scan every 3rd frame)
const FRAME_SKIP = isMobile ? 3 : 1;

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  // DOM container ref
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scanner instance ref
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef(0); // Track frames for skipping

  // Native Barcode Detector API ref
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const useNativeApiRef = useRef(false);

  // Guards against double-initialization
  const isInitializedRef = useRef(false);
  const isScanningRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [usingNativeApi, setUsingNativeApi] = useState(false);

  // Callback refs for scan functions (stable across re-renders)
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  // Keep refs updated
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  // Cleanup function
  const cleanupScanner = useCallback(() => {
    isScanningRef.current = false;
    frameCountRef.current = 0;

    if (requestAnimationFrameRef.current !== null) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = null;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (e) {
        // Ignore cleanup errors
      }
      readerRef.current = null;
    }

    barcodeDetectorRef.current = null;
    useNativeApiRef.current = false;

    setCameraActive(false);
    setTorchOn(false);
    setTorchAvailable(false);
    setUsingNativeApi(false);
  }, []);

  // Toggle torch/flash
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length === 0) return;

      const track = tracks[0];
      const capabilities = track.getCapabilities();

      // Check if torch is supported
      if (!("torch" in capabilities) || !capabilities.torch) {
        setTorchAvailable(false);
        return;
      }

      const newState = !torchOn;

      // Try different constraint formats for Android compatibility
      try {
        // Format 1: Standard advanced constraint (works on iOS)
        await track.applyConstraints({
          advanced: [{ torch: newState }] as any,
        });
        setTorchOn(newState);
      } catch (e) {
        // Format 2: Direct constraint (some Android versions)
        try {
          await track.applyConstraints({
            torch: newState,
          } as any);
          setTorchOn(newState);
        } catch (e2) {
          console.debug("Torch toggle failed:", e2);
          setTorchAvailable(false);
        }
      }
    } catch (err) {
      console.debug("Torch toggle error:", err);
      setTorchAvailable(false);
    }
  }, [torchOn]);

  // Scan using Native Barcode Detection API (with frame skip for mobile)
  const scanWithNativeAPI = useCallback(
    (video: HTMLVideoElement) => {
      if (!isScanningRef.current || !barcodeDetectorRef.current) return;

      frameCountRef.current++;

      // Skip frames on mobile for performance
      if (frameCountRef.current % FRAME_SKIP !== 0) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithNativeAPI(video),
        );
        return;
      }

      barcodeDetectorRef.current
        .detect(video)
        .then((barcodes) => {
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code) {
              isScanningRef.current = false;
              cleanupScanner();
              onScanRef.current(code);
              onCloseRef.current();
              return;
            }
          }
          requestAnimationFrameRef.current = requestAnimationFrame(() =>
            scanWithNativeAPI(video),
          );
        })
        .catch(() => {
          requestAnimationFrameRef.current = requestAnimationFrame(() =>
            scanWithNativeAPI(video),
          );
        });
    },
    [cleanupScanner],
  );

  // Scan using ZXing library (with frame skip for mobile)
  const scanWithZXing = useCallback(
    (video: HTMLVideoElement) => {
      if (!isScanningRef.current || !readerRef.current) return;

      frameCountRef.current++;

      // Skip frames on mobile for performance
      if (frameCountRef.current % FRAME_SKIP !== 0) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
        return;
      }

      if (
        video.readyState === video.HAVE_ENOUGH_DATA &&
        !video.paused &&
        !video.ended
      ) {
        readerRef.current
          .decodeFromInputVideoDevice(streamRef.current?.id || undefined, video)
          .then((result) => {
            if (result) {
              isScanningRef.current = false;
              cleanupScanner();
              onScanRef.current(result.getText());
              onCloseRef.current();
              return;
            }
            requestAnimationFrameRef.current = requestAnimationFrame(() =>
              scanWithZXing(video),
            );
          })
          .catch((err) => {
            if (!(err instanceof NotFoundException)) {
              console.debug("ZXing scan error:", err);
            }
            requestAnimationFrameRef.current = requestAnimationFrame(() =>
              scanWithZXing(video),
            );
          });
      } else {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
      }
    },
    [cleanupScanner],
  );

  useEffect(() => {
    if (!isOpen || isInitializedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setCameraActive(false);
    setTorchOn(false);

    const initTimer = setTimeout(async () => {
      if (
        !containerRef.current ||
        !videoRef.current ||
        isInitializedRef.current
      ) {
        setIsLoading(false);
        return;
      }

      isInitializedRef.current = true;
      isScanningRef.current = true;
      frameCountRef.current = 0;

      try {
        // Check if Native Barcode Detection API is available
        // @ts-ignore - BarcodeDetector is not in standard types yet
        if ("BarcodeDetector" in window) {
          try {
            // @ts-ignore
            barcodeDetectorRef.current = new BarcodeDetector({
              formats: [
                "ean_13",
                "ean_8",
                "upc_a",
                "upc_e",
                "code_128",
                "code_39",
                "qr_code",
              ],
            });
            useNativeApiRef.current = true;
            setUsingNativeApi(true);
            console.debug("Using Native Barcode Detection API");
          } catch {
            // Native API available but failed to initialize, fall back to ZXing
          }
        }

        // Initialize ZXing reader as fallback
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        readerRef.current = new BrowserMultiFormatReader(hints);

        // Get cameras and find back camera
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        if (videoDevices.length === 0) {
          throw new Error("No camera found");
        }

        // Find back camera
        const backCamera =
          videoDevices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("environment") ||
              d.label.toLowerCase().includes("rear"),
          ) || videoDevices[0];

        // Lower resolution on mobile for better performance
        const resolution = isMobile
          ? { width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: backCamera.deviceId },
            facingMode: { ideal: "environment" },
            ...resolution,
          },
        });

        streamRef.current = stream;

        // Check torch capability
        const videoTrack = stream.getVideoTracks()[0];
        try {
          const capabilities = videoTrack.getCapabilities();
          const hasTorch =
            "torch" in capabilities && (capabilities.torch as boolean);
          setTorchAvailable(hasTorch);
        } catch {
          // getCapabilities might not be supported in some browsers
          setTorchAvailable(false);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                setCameraActive(true);
                setIsLoading(false);
                setError(null);

                if (useNativeApiRef.current && barcodeDetectorRef.current) {
                  scanWithNativeAPI(videoRef.current!);
                } else {
                  scanWithZXing(videoRef.current!);
                }
              })
              .catch((err) => {
                console.error("Video play error:", err);
                setError("Gagal memutar video kamera.");
                setIsLoading(false);
              });
          };
        }
      } catch (err: unknown) {
        let errorMsg = "Gagal mengakses kamera.";

        if (err instanceof Error) {
          const message = err.message.toLowerCase();

          if (
            message.includes("permission") ||
            message.includes("denied") ||
            message.includes("not allowed")
          ) {
            errorMsg =
              "Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.";
          } else if (
            message.includes("not found") ||
            message.includes("no device")
          ) {
            errorMsg = "Tidak ada kamera yang ditemukan.";
          } else if (message.includes("https") || message.includes("secure")) {
            errorMsg =
              "Akses kamera memerlukan HTTPS (atau localhost untuk pengembangan).";
          } else {
            errorMsg = `Gagal mengakses kamera: ${err.message}`;
          }
        }

        setError(errorMsg);
        setIsLoading(false);
        isScanningRef.current = false;
        isInitializedRef.current = false;

        console.error("Scanner error:", err);
      }
    }, 150);

    return () => {
      clearTimeout(initTimer);
      cleanupScanner();
      isInitializedRef.current = false;
    };
  }, [isOpen, cleanupScanner, scanWithNativeAPI, scanWithZXing]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanupScanner();
      isInitializedRef.current = false;
    }
  }, [isOpen, cleanupScanner]);

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
            className="w-full rounded-lg overflow-hidden bg-slate-800 aspect-video max-h-64"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          </div>

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

          {/* Scanning indicator */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-primary/50 animate-pulse" />
            </div>
          )}
        </div>

        {cameraActive && (
          <p className="text-xs text-slate-400 text-center mt-4">
            Arahkan kamera ke barcode produk. Pastikan pencahayaan cukup.
          </p>
        )}

        {/* Using Native API indicator */}
        {cameraActive && usingNativeApi && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-xs text-green-400">Native API Active</span>
            <span className="text-xs text-slate-500">• Lebih cepat</span>
          </div>
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

        {/* Debug info - show if mobile optimization is active */}
        {cameraActive && isMobile && import.meta.env.DEV && (
          <div className="mt-2 text-xs text-amber-400 text-center">
            Mobile optimization active (lower resolution, frame skipping)
          </div>
        )}
      </div>
    </div>
  );
}
