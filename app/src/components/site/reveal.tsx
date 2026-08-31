/**
 * Bottom-to-top rise on scroll. Transform-only (content is always visible and
 * present in SSR HTML), disconnects after firing, honors reduced motion.
 */
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={["si-rise", className].filter(Boolean).join(" ")}
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
