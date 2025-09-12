// features/a11y/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getItems = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = getItems();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }

    const prev = document.activeElement as HTMLElement | null;
    root.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => getItems()[0]?.focus());
    return () => {
      root.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [active]);

  return ref; // <div ref={trapRef}>…</div>
}
