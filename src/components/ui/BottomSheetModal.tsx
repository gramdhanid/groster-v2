import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';
import { useModalBackButton } from '@/hooks/useModalBackButton';
import { ModalPortal } from './ModalPortal';

export interface ModalButton {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Additional classes for the button */
  className?: string;
}

export interface BottomSheetModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Title displayed in the header */
  title: string;
  /** Optional icon displayed next to the title */
  icon?: ReactNode;
  /** Size of the modal on desktop */
  size?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Enable swipe-to-dismiss gesture (default: true) */
  swipeToDismiss?: boolean;
  /** Body content - scrollable */
  children: ReactNode;
  /** Optional footer content (buttons, totals, etc.) */
  footer?: ReactNode;
  /** Content to show above the buttons (e.g., totals, summary) */
  footerSummary?: ReactNode;
  /** Primary action button (right side when both buttons present) */
  primaryButton?: ModalButton;
  /** Secondary/cancel button (left side when both buttons present) */
  secondaryButton?: ModalButton;
  /** Additional classes for the modal container */
  className?: string;
  /** Additional classes for the body content */
  bodyClassName?: string;
}

const sizeClasses = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full',
};

/**
 * Reusable bottom sheet modal component.
 *
 * Features:
 * - Swipe-to-dismiss on mobile (drag down to close)
 * - Click outside to close
 * - Scroll lock integration
 * - Handle indicator on mobile
 * - Responsive: bottom sheet on mobile, centered modal on desktop
 * - Scrollable body with optional fixed footer
 *
 * @example
 * ```tsx
 * <BottomSheetModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Add Item"
 *   icon={<Plus />}
 *   size="lg"
 *   footer={<ActionButtons />}
 * >
 *   <FormContent />
 * </BottomSheetModal>
 * ```
 */
export function BottomSheetModal({
  isOpen,
  onClose,
  title,
  icon,
  size = '2xl',
  swipeToDismiss = true,
  children,
  footer,
  footerSummary,
  primaryButton,
  secondaryButton,
  className,
  bodyClassName,
}: BottomSheetModalProps) {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  // Handle mobile back button
  useModalBackButton({ isOpen, onClose });

  // Setup swipe-to-dismiss
  const { handlers, headerHandlers, style, contentRef, onScroll } = useSwipeToDismiss({
    isOpen,
    onClose,
    enabled: swipeToDismiss,
  });

  const modalSize = sizeClasses[size];

  // Helper component to render a button
  const ModalButton = ({
    button,
    variant,
    widthClass,
  }: {
    button: ModalButton;
    variant: 'primary' | 'secondary';
    widthClass?: string;
  }) => {
    const baseClasses = 'py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2';

    const variantClasses = {
      primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90',
      secondary: 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-0',
    };

    return (
      <button
        type="button"
        onClick={button.onClick}
        disabled={button.disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          widthClass,
          button.disabled && 'opacity-50 cursor-not-allowed',
          button.className,
        )}
      >
        {button.icon}
        {button.label}
      </button>
    );
  };

  // Render buttons from props
  const renderButtons = () => {
    const hasBothButtons = primaryButton && secondaryButton;
    const containerClasses = hasBothButtons ? 'flex gap-3' : '';
    const buttonWidthClass = hasBothButtons ? 'flex-1' : 'w-full';

    return (
      <div className={containerClasses}>
        {secondaryButton && (
          <ModalButton
            button={secondaryButton}
            variant="secondary"
            widthClass={buttonWidthClass}
          />
        )}
        {primaryButton && (
          <ModalButton
            button={primaryButton}
            variant="primary"
            widthClass={buttonWidthClass}
          />
        )}
      </div>
    );
  };

  // Footer logic: if custom footer is provided, use it; otherwise render button props
  const footerContent = footer || (
    <>
      {footerSummary && <div className="mb-3">{footerSummary}</div>}
      {primaryButton || secondaryButton ? renderButtons() : null}
    </>
  );

  return (
    <ModalPortal isActive={isOpen}>
      <div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      >
      <div
        className={cn(
          'bg-[#0f172a] w-full rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative max-h-[85vh] flex flex-col',
          modalSize,
          className
        )}
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        {/* Handle Indicator */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0" {...headerHandlers}>
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pb-6 border-b border-slate-800 flex-shrink-0"
          {...headerHandlers}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <h2 className="text-xl font-black tracking-tight">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div
          ref={contentRef}
          className={cn('overflow-y-auto flex-1 min-h-0', bodyClassName)}
          onScroll={onScroll}
          {...handlers}
        >
          {children}
        </div>

        {/* Footer */}
        {footerContent && (
          <div className="p-6 pt-0 flex-shrink-0">
            {footerContent}
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}
