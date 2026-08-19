// Generates theme.css: the static baseline is the deriver's output at the middle
// notch, Iron family, default vision, one block per mode. This makes the static
// layer and the parametric layer one source of truth, so "Soft Light" means the
// same band of the ladder in both. Run: node scripts/build-theme-css.mjs
//
// The non-color tokens, the System resolution model, the vision text-encoding
// rules, and the forced-colors block are structural and are written here as
// templates; only the palette values come from the deriver.
import { writeFileSync } from 'node:fs';
import { CONFIG, deriveByKey } from '../derive.js';

const MIDDLE = 1;
const FAMILY = 'iron';

function palette(modeKey, indent, opts = {}) {
  const t = deriveByKey(modeKey, MIDDLE, FAMILY, 'default', opts);
  return CONFIG.cssOrder.map((k) => `${indent}${k}: ${t[k]};`).join('\n');
}

const header = `/*
 * TEMPER - a five-mode semantic color system (a well-tempered palette)
 * License: Apache-2.0
 *
 * GENERATED FILE. The four palettes below are emitted from derive.js at the
 * middle notch, Iron family, default vision, by scripts/build-theme-css.mjs, so
 * the static baseline and the parametric deriver share one source of truth. Edit
 * the deriver's CONFIG and regenerate rather than editing values here by hand.
 *
 * Modes: System, Light, Soft Light, Soft Dark, Dark.
 * Every visible color comes from a semantic custom property. Components read
 * roles (surface, border, text) and never hard-code a hex value, so a single
 * mode switch restyles the whole page.
 *
 * Selection model:
 *   :root                      -> non-color tokens plus the Light palette as
 *                                 the default, so a page renders correctly
 *                                 before JavaScript runs.
 *   [data-theme="system"]      -> follows the OS via prefers-color-scheme.
 *                                 Light OS resolves to the Light palette
 *                                 (inherited from :root); dark OS resolves to
 *                                 Dark, the deep low-light palette. To prefer the
 *                                 gentler Soft Dark, swap the Dark values in the
 *                                 media block below for the Soft Dark palette.
 *   [data-theme="light"]       -> Light
 *   [data-theme="soft-light"]  -> Soft Light
 *   [data-theme="soft-dark"]   -> Soft Dark
 *   [data-theme="dark"]        -> Dark
 *
 * color-scheme is set per mode so native form controls, scrollbars, and
 * caret colors follow the active palette.
 */

:root {
  /* Non-color design tokens (shared, mode-independent) */
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

  /* Type scale. Fixed, not solved: one canonical set so sizes and weights do not
     drift across components. rem so it respects the reader's font size; the base
     size and normal line-height meet readability floors. */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px, body floor */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;    /* body floor */
  --leading-relaxed: 1.625;

  /* Spacing scale. Fixed, 4px base, names aligned to the common step scale
     (space-4 is 16px) so a build maps them to what it already reaches for,
     which is what stops gap drift rather than fighting it. */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --ring-width: 3px;
  --border-width: 1px;

  /* Default palette: Light. Also serves System in a light-preference OS. */
  color-scheme: light;

${palette('light', '  ')}
}

/*
 * System mode in a dark-preference OS resolves to Dark (the deep palette). This
 * is the least surprising default: an OS set to Dark Mode gets the deep Dark
 * palette. For the gentler Soft Dark as the System-dark target, swap these
 * values for the Soft Dark palette, or drive the theme from the tuner with
 * resolveSystem's systemDark option set to 'soft-dark'.
 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]),
  [data-theme="system"] {
    color-scheme: dark;

${palette('dark', '    ')}
  }
}

/* Explicit Light. Re-declared so it holds even in a dark-preference OS. */
[data-theme="light"] {
  color-scheme: light;

${palette('light', '  ')}
}

/* Soft Light: warmer and gentler than Light, for long-form reading. */
[data-theme="soft-light"] {
  color-scheme: light;

${palette('soft-light', '  ')}
}

/* Soft Dark: the primary dark working environment. Dark gray, not black. */
[data-theme="soft-dark"] {
  color-scheme: dark;

${palette('soft-dark', '  ')}
}

/* Dark: deeper low-light mode. Still readable, borders still visible. */
[data-theme="dark"] {
  color-scheme: dark;

${palette('dark', '  ')}
}
`;

const tail = `
/* A shared selection color for the whole document. */
::selection {
  background: var(--color-selection);
}

/*
 * Vision: redundant text encoding (the primary color-vision guard), ON BY
 * DEFAULT.
 *
 * Meaning is never carried by color alone. Links carry an underline and status
 * dots reveal a text mark with no attribute set, so a build that never wires a
 * vision control, and a reader who never finds one, still get the guard. This is
 * an accommodation by default, not an option to be discovered. Text survives
 * every deficiency, monochrome output, and a screen reader, which is why this is
 * the primary guard; the palette's confusion-safe status hues are the secondary
 * one and are selected per data-vision by the tuner.
 *
 * A site with a specific reason to drop the redundant channel opts out
 * explicitly with data-vision="color-only" on the root. Opting out is a
 * deliberate act, which is the correct polarity.
 *
 * Component contract: any meaning a component encodes in color it must also
 * expose as text or a glyph. For a status indicator, give the element the
 * "status-dot" class and a "data-letter" attribute (for example data-letter="S"
 * for success), and the letter renders beside the dot.
 */
a {
  text-decoration: underline;
}
[data-vision="color-only"] a {
  text-decoration: none;
}
/*
 * Scoped opt-out for chrome. A nav, toolbar, or footer whose links are already
 * distinguished by layout can drop the underline by setting data-underline="none"
 * on the container, without weakening the content default and without reaching
 * for the global color-only opt-out. Opting out stays a deliberate, local act.
 */
[data-underline="none"] a {
  text-decoration: none;
}

.status-dot {
  position: relative;
}
.status-dot::after {
  content: attr(data-letter);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 4px;
  font-family: var(--font-mono);
  font-size: 0.7em;
  line-height: 1;
  color: var(--color-text-secondary);
}
[data-vision="color-only"] .status-dot::after {
  content: none;
}

/*
 * forced-colors (Windows High Contrast and similar): step aside.
 *
 * When the user has imposed a limited system palette, the correct behavior for a
 * theming package is to yield, not to fight it with custom colors. Under
 * forced-colors the browser already substitutes system colors for most
 * properties; this block makes the deference explicit and keeps the redundant
 * text encoding on, since forced-colors does not restore color as a carrier of
 * meaning. The status dot border ensures the indicator stays visible when its
 * background is overridden.
 */
@media (forced-colors: active) {
  :root { color-scheme: light dark; }
  a { text-decoration: underline; }
  .status-dot {
    border: 1px solid CanvasText;
  }
  .status-dot::after {
    content: attr(data-letter);
    color: CanvasText;
  }
}
`;

// prefers-contrast: more. Raised-contrast palettes emitted from the deriver's
// highContrast targets, so the static baseline honors an OS "increase contrast"
// preference with zero JavaScript, not only through the tuner. Structure mirrors
// the base blocks: :root carries the light palette (also System in a light OS),
// and a combined media query re-solves System to Dark for a dark-preference OS.
// Later in source than the base blocks, so it wins only when both match.
const highContrast = `
/*
 * prefers-contrast: more - raised-contrast palettes.
 *
 * Every value only raises contrast: text and links spend more of the budget and
 * lift their floors, so the result stays WCAG AA and usually reaches AAA. The
 * mode does not shift; only contrast rises. This makes the accommodation a
 * default driven by the platform signal rather than an option behind the tuner.
 */
@media (prefers-contrast: more) {
  :root {
${palette('light', '    ', { highContrast: true })}
  }

  [data-theme="light"] {
${palette('light', '    ', { highContrast: true })}
  }

  [data-theme="soft-light"] {
${palette('soft-light', '    ', { highContrast: true })}
  }

  [data-theme="soft-dark"] {
${palette('soft-dark', '    ', { highContrast: true })}
  }

  [data-theme="dark"] {
${palette('dark', '    ', { highContrast: true })}
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root:not([data-theme]),
  [data-theme="system"] {
${palette('dark', '    ', { highContrast: true })}
  }
}
`;

writeFileSync(new URL('../theme.css', import.meta.url), header + tail + highContrast);
console.log('Wrote theme.css from derive.js (middle notch, Iron family). Soft Light base:',
  deriveByKey('soft-light', MIDDLE, FAMILY, 'default')['--color-bg-base']);
