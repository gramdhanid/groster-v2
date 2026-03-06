import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useModalBackButton } from "@/hooks/useModalBackButton";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconBg: "bg-red-500/10 text-red-400",
    iconPing: "bg-red-500",
    confirmBtn:
      "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-orange-500/10 text-orange-400",
    iconPing: "bg-orange-500",
    confirmBtn:
      "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/10 text-blue-400",
    iconPing: "bg-blue-500",
    confirmBtn:
      "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20",
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Tutup",
  cancelText = "Batal",
  variant = "warning",
}: ConfirmDialogProps) {
  // Handle mobile back button
  useModalBackButton({ isOpen, onClose });

  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 relative ${config.iconBg}`}
          >
            <Icon size={40} className="" />
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-20 ${config.iconPing}`}
            />
          </div>

          <h2 className="text-xl font-black text-white mb-3">{title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-base bg-slate-800 text-white hover:bg-slate-700 transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] ${config.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
