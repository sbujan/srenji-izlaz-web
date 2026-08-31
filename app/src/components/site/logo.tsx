/** Inline rebuild of the Srednji izlaz mark: the blue open exit frame. */
export function LogoMark() {
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <path
        d="M84 46 V16 H16 V124 H84 V94"
        fill="none"
        stroke="var(--si-accent, #3866b8)"
        strokeWidth={18}
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="si-logo">
      <LogoMark />
      {compact ? null : <span className="si-logo-word">SREDNJI IZLAZ</span>}
    </span>
  );
}
