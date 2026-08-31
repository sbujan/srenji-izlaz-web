/**
 * The company's actual logo lockup — the blue exit frame with the wordmark
 * running through it — as a single supplied image.
 *
 * This replaces an inline rebuild that set a tracked wordmark BESIDE a frame
 * glyph. That approximation never matched the real mark, and its wide tracking
 * forced the phone breakpoints to squeeze and finally hide the wordmark,
 * leaving a bare frame — the "logo not showing correctly on mobile" report.
 * The real lockup is compact enough to render whole at every viewport.
 */
export function Logo() {
  return (
    <img
      alt="Srednji izlaz"
      className="si-logo"
      height={297}
      src="/assets/brand/logo.png"
      width={583}
    />
  );
}
