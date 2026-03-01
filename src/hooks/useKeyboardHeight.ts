import { useState, useEffect } from 'react';

interface UseKeyboardHeightOptions {
  enabled?: boolean;
}

/**
 * Hook untuk mendeteksi tinggi keyboard mobile menggunakan VisualViewport API
 * Berguna untuk modal/form yang ter-cover keyboard di mobile
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
 */
export function useKeyboardHeight(options: UseKeyboardHeightOptions = {}) {
  const { enabled = true } = options;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      if (window.visualViewport) {
        const newKeyboardHeight = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(Math.max(0, newKeyboardHeight));
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    // Initial check in case keyboard is already open
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [enabled]);

  return { keyboardHeight, isKeyboardOpen: keyboardHeight > 0 };
}
