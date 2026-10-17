import { useEffect, useState, type RefObject } from 'react';

/** Shared mobile interaction behaviour. Desktop visual geometry is unaffected. */
export function useCompactViewport() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
    setCompact(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return compact;
}

/** Lock background scroll and keep keyboard focus inside an active mobile modal. */
export function useMobileModal(
  isOpen: boolean,
  isMobile: boolean,
  dialogRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter(el => el.getClientRects().length > 0);
      if (!focusables.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = oldOverflow;
    };
  }, [isOpen, isMobile, dialogRef]);
}
