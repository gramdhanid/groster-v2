import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';
import { useModalBackButton } from '@/hooks/useModalBackButton';
import { ModalPortal } from './ModalPortal';

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
  className,
  bodyClassName,
}: BottomSheetModalProps) {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  // Handle mobile back button
  useModalBackButton({ isOpen, onClose });

  // Setup swipe-to-dismiss
  const { handlers, style, contentRef, onScroll } = useSwipeToDismiss({
    isOpen,
    onClose,
    enabled: swipeToDismiss,
  });

  const modalSize = sizeClasses[size];

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
        {...handlers}
      >
        {/* Handle Indicator */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-6 border-b border-slate-800 flex-shrink-0">
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
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-0 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}
