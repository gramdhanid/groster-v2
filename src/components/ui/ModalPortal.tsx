import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isActive: boolean;
}

/**
 * ModalPortal - Renders modal content using React Portal
 *
 * This component ensures modals are rendered at the document.body level,
 * outside any stacking context issues. This prevents z-index conflicts
 * with parent components like TopBar.
 *
 * @example
 * ```tsx
 * <ModalPortal isActive={isOpen}>
 *   <ModalContent />
 * </ModalPortal>
 * ```
 */
export function ModalPortal({ children, isActive }: ModalPortalProps) {
  // Only render when active to avoid unnecessary DOM elements
  if (!isActive) return null;

  return createPortal(
    children,
    document.body
  );
}
