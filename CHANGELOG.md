# Changelog

All notable changes to TEMPER are recorded here. This project has not yet cut a numbered release; changes below are unreleased.

## Unreleased

### Changed

- Color-vision redundant text encoding is now on by default. Links carry an underline and status dots reveal their letter with no attribute set, so a build that never wires a vision control, and a reader who never finds one, still get the guard. This is the primary color-vision guard, and it is now an accommodation by default rather than an option to discover.
- Corrected the license label in the generated `theme.css` header and the demo page to Apache-2.0, to match the repository `LICENSE`.

### Added

- `data-vision="color-only"` on the root: an explicit opt-out that drops the redundant text encoding where a site has a specific reason to.
- `data-underline="none"` on a container: a scoped opt-out for chrome (a nav, toolbar, or footer whose links are already distinguished by layout) that drops the underline there without weakening the content default.
- A `prefers-contrast: more` block in the static `theme.css`, carrying raised-contrast palettes for every mode. An operating-system "increase contrast" preference is now honored on the static baseline with no JavaScript, not only through the tuner. Every value only raises contrast, so the result stays within the contrast floors.
