import type { CSSProperties } from 'react';

/**
 * Lightweight SVG icon renderer backed by `/public/icons/*.svg`. We use a
 * plain `<img>` (not `next/image`) because:
 *
 * 1. The source SVGs are tiny (<2 KB) — Next.js image optimization gives
 *    nothing here and actively causes hydration quirks where the server
 *    and client disagree on the rendered style object.
 * 2. Next.js `<Image>` emits an LCP warning for any above-the-fold icon
 *    without `priority`, which is noisy for nav chrome.
 * 3. Aspect-ratio warnings fire when only one of width/height is set via
 *    CSS — `<img>` with explicit dimensions avoids this entirely.
 *
 * Use this component for icons whose colors are *baked into the SVG file*
 * (heart, share, close, dots, etc.). For icons that rely on
 * `fill="currentColor"` (tab bar, etc.) use the inline React components
 * in `components/icons/TabIcons.tsx` instead — `<img>` does not cascade
 * CSS color into external SVG.
 */
interface IconProps {
  /** Basename (without `.svg`) of the file in `/public/icons/`. */
  name: string;
  /** Pixel size applied to both width and height (SVGs here are square-ish). */
  size?: number;
  /** Above-the-fold icons should pass `priority` to eager-load. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Icon({
  name,
  size = 24,
  priority = false,
  className,
  style,
}: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      aria-hidden
      className={className}
      style={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
