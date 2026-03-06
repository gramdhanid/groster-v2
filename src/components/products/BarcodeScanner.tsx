import { useEffect, useRef, useState, useCallback } from "react";
import { X, Loader, CameraOff, Flashlight } from "lucide-react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
  Result,
} from "@zxing/library";

interface DetectedBarcode {
  format: string;
  rawValue: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  static getSupportedFormats(): Promise<string[]>;
  constructor(options?: BarcodeDetectorOptions);
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const FRAME_SKIP = isMobile ? 3 : 1;

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const useNativeApiRef = useRef(false);

  const isInitializedRef = useRef(false);
  const isScanningRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [usingNativeApi, setUsingNativeApi] = useState(false);

  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  const cleanupScanner = useCallback(() => {
    isScanningRef.current = false;
    frameCountRef.current = 0;

    if (requestAnimationFrameRef.current !== null) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (_) {}
      readerRef.current = null;
    }

    barcodeDetectorRef.current = null;
    useNativeApiRef.current = false;

    setCameraActive(false);
    setTorchOn(false);
    setTorchAvailable(false);
    setUsingNativeApi(false);
  }, []);

  // FIX ANDROID: Torch detection yang lebih robust
  // Masalah sebelumnya: cast `capabilities.torch` ke boolean langsung — di Android
  // kadang nilainya bukan boolean tapi tetap truthy/valid. Solusi: cek dengan cara berbeda.
  const checkTorchAvailability = useCallback((stream: MediaStream) => {
    try {
      const track = stream.getVideoTracks()[0];
      if (!track) return;

      const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
        torch?: boolean;
      };

      // Cek keberadaan property torch, bukan cast ke boolean
      const hasTorch =
        "torch" in capabilities && capabilities.torch !== undefined;

      setTorchAvailable(hasTorch);
    } catch {
      // getCapabilities() tidak support di beberapa browser lama
      setTorchAvailable(false);
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;

      const newState = !torchOn;

      try {
        // Format standard (iOS Safari & Chrome Desktop)
        await track.applyConstraints({
          advanced: [{ torch: newState }] as unknown as MediaTrackConstraintSet[],
        });
        setTorchOn(newState);
      } catch {
        try {
          // Format alternatif (beberapa Android Chrome)
          await (track.applyConstraints as Function)({ torch: newState });
          setTorchOn(newState);
        } catch {
          setTorchAvailable(false);
        }
      }
    } catch {
      setTorchAvailable(false);
    }
  }, [torchOn]);

  // FIX iOS: Native BarcodeDetector scan pakai canvas bukan video langsung
  // iOS Safari punya issue dengan passing HTMLVideoElement ke BarcodeDetector.detect()
  // Solusinya: capture frame ke canvas terlebih dahulu, baru pass ImageData ke detector
  const scanWithNativeAPI = useCallback(
    (video: HTMLVideoElement) => {
      if (!isScanningRef.current || !barcodeDetectorRef.current) return;

      frameCountRef.current++;
      if (frameCountRef.current % FRAME_SKIP !== 0) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithNativeAPI(video),
        );
        return;
      }

      // Pastikan video sudah ready
      if (video.readyState < video.HAVE_ENOUGH_DATA || video.paused) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithNativeAPI(video),
        );
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithNativeAPI(video),
        );
        return;
      }

      // Sync canvas size ke video size
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithNativeAPI(video),
        );
        return;
      }

      // Draw current video frame ke canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect dari canvas (bukan dari video langsung — ini fix iOS)
      barcodeDetectorRef.current
        .detect(canvas)
        .then((barcodes) => {
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            isScanningRef.current = false;
            const code = barcodes[0].rawValue;
            cleanupScanner();
            onScanRef.current(code);
            onCloseRef.current();
            return;
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

  // FIX iOS ZXing: Ganti decodeFromInputVideoDevice (deprecated & buggy di iOS)
  // dengan manual frame decode pakai decodeFromImageElement via canvas
  const scanWithZXing = useCallback(
    (video: HTMLVideoElement) => {
      if (!isScanningRef.current || !readerRef.current) return;

      frameCountRef.current++;
      if (frameCountRef.current % FRAME_SKIP !== 0) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
        return;
      }

      if (video.readyState < video.HAVE_ENOUGH_DATA || video.paused) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
        return;
      }

      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        requestAnimationFrameRef.current = requestAnimationFrame(() =>
          scanWithZXing(video),
        );
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let result: Result | null = null;
      try {
        // decodeFromCanvas: lebih stabil di iOS vs decodeFromInputVideoDevice
        // @ts-ignore - decodeFromCanvas exists but not in TypeScript defs
        result = readerRef.current.decodeFromCanvas(canvas);
      } catch (err) {
        if (!(err instanceof NotFoundException)) {
          console.debug("ZXing decode error:", err);
        }
      }

      if (result) {
        isScanningRef.current = false;
        const code = result.getText();
        cleanupScanner();
        onScanRef.current(code);
        onCloseRef.current();
        return;
      }

      requestAnimationFrameRef.current = requestAnimationFrame(() =>
        scanWithZXing(video),
      );
    },
    [cleanupScanner],
  );

  useEffect(() => {
    if (!isOpen || isInitializedRef.current) return;

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
        // Cek Native BarcodeDetector
        // iOS 17+ support BarcodeDetector tapi hanya via canvas, bukan video langsung
        if ("BarcodeDetector" in window) {
          try {
            // @ts-ignore
            const supported = await BarcodeDetector.getSupportedFormats();
            const targetFormats = [
              "ean_13",
              "ean_8",
              "upc_a",
              "upc_e",
              "code_128",
              "code_39",
              "qr_code",
            ].filter((f) => supported.includes(f));

            if (targetFormats.length > 0) {
              // @ts-ignore
              barcodeDetectorRef.current = new BarcodeDetector({
                formats: targetFormats,
              });
              useNativeApiRef.current = true;
              setUsingNativeApi(true);
            }
          } catch {
            // Fallback ke ZXing
          }
        }

        // Setup ZXing hints
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

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        if (videoDevices.length === 0) {
          throw new Error("No camera found");
        }

        const backCamera =
          videoDevices.find((d) => {
            const label = d.label.toLowerCase();
            return (
              label.includes("back") ||
              label.includes("environment") ||
              label.includes("rear")
            );
          }) || videoDevices[videoDevices.length - 1]; // Biasanya kamera belakang ada di index terakhir

        const resolution = isMobile
          ? { width: { ideal: 1280 }, height: { ideal: 720 } } // Naikkan resolusi — barcode perlu detail
          : { width: { ideal: 1920 }, height: { ideal: 1080 } };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: backCamera.deviceId
              ? { exact: backCamera.deviceId }
              : undefined,
            facingMode: { ideal: "environment" },
            ...resolution,
          },
        });

        streamRef.current = stream;

        // Cek torch setelah stream ready
        checkTorchAvailability(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("autoplay", "true");
          videoRef.current.muted = true;

          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) return reject(new Error("Video ref lost"));

            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current!.play();
                resolve();
              } catch (err) {
                reject(err);
              }
            };

            // Timeout fallback jika onloadedmetadata tidak trigger
            setTimeout(() => resolve(), 3000);
          });

          setCameraActive(true);
          setIsLoading(false);
          setError(null);

          if (useNativeApiRef.current && barcodeDetectorRef.current) {
            scanWithNativeAPI(videoRef.current);
          } else {
            scanWithZXing(videoRef.current);
          }
        }
      } catch (err: unknown) {
        let errorMsg = "Gagal mengakses kamera.";

        if (err instanceof Error) {
          const msg = err.message.toLowerCase();
          if (
            msg.includes("permission") ||
            msg.includes("denied") ||
            msg.includes("not allowed")
          ) {
            errorMsg =
              "Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.";
          } else if (msg.includes("not found") || msg.includes("no device")) {
            errorMsg = "Tidak ada kamera yang ditemukan.";
          } else if (msg.includes("https") || msg.includes("secure")) {
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
  }, [
    isOpen,
    cleanupScanner,
    scanWithNativeAPI,
    scanWithZXing,
    checkTorchAvailability,
  ]);

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

        <div className="relative">
          <div
            ref={containerRef}
            className="w-full rounded-lg overflow-hidden bg-slate-800 aspect-video max-h-64"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
            />
            {/* Canvas hidden — dipakai untuk frame capture (fix iOS) */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

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

        {cameraActive && usingNativeApi && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-xs text-green-400">Native API Active</span>
            <span className="text-xs text-slate-500">• Lebih cepat</span>
          </div>
        )}

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

        {cameraActive && isMobile && import.meta.env.DEV && (
          <div className="mt-2 text-xs text-amber-400 text-center">
            {isIOS ? "iOS" : "Android"} — Canvas-based scanning active
          </div>
        )}
      </div>
    </div>
  );
}
