# Custom Components

## Purpose

These custom components extend the Horizon theme without overriding or modifying any existing Horizon blocks, sections, or snippets. They are designed to give merchants and developers the flexibility to compose complex, responsive layouts from simple, reusable building blocks — all configurable through the Shopify theme editor.

They follow Horizon conventions: 750px desktop/mobile breakpoint, translation keys in `locales/en.default.schema.json`, CSS via `{% stylesheet %}` (no Tailwind), and independent desktop/mobile settings where it matters.

## Section

| Component | File | Description |
|-----------|------|-------------|
| Generic Section | `sections/generic-section.liquid` | Full-width section container with configurable padding, max-width, and color scheme. |

## Blocks

| Component | File | Description |
|-----------|------|-------------|
| Custom Text | `blocks/custom-text.liquid` | Rich text with independent desktop/mobile typography presets, custom font weight, margins, and color. |
| Custom Image | `blocks/custom-image.liquid` | Responsive image with separate desktop/mobile sources, aspect ratios, width, height, and border controls. |
| Custom Icon | `blocks/custom-icon.liquid` | SVG icon or custom image upload with grouped icon picker, rotation, responsive sizing, and color override. |
| Custom Border | `blocks/custom-border.liquid` | Responsive divider with independent desktop/mobile thickness, width, margins, and style (solid/dashed/dotted). |
| Custom Group | `blocks/custom-group.liquid` | Flexbox container with independent desktop/mobile layout, gap, alignment, and appearance controls. |
| Custom Grid Row | `blocks/custom-grid-row.liquid` | 12-column CSS grid container for grid column blocks with configurable gaps and alignment. |
| Custom Hero | `blocks/custom-hero.liquid` | Hero banner with background image/video, color overlays, and flexible content positioning. |
| Custom Carousel | `blocks/custom-carousel.liquid` | Swiper-powered carousel with pagination dots and configurable slide behavior. |
| Custom Carousel Arrow | `blocks/custom-carousel-arrow.liquid` | Previous/next navigation arrows for the Custom Carousel block. |

## Snippets

| Snippet | File | Description |
|---------|------|-------------|
| Custom Text | `snippets/custom-text.liquid` | Renders the custom text block with responsive typography, margins, and mobile content switching. |
| Custom Group | `snippets/custom-group.liquid` | Renders the custom group block with flexbox layout and responsive settings. |

## Guidelines

- These components are additive. They do not replace or conflict with any built-in Horizon blocks or sections.
- All user-facing strings use `t:` translation keys from `locales/en.default.schema.json`.
- Desktop styles apply at `min-width: 750px`. Mobile styles apply below `750px`. This matches the Horizon breakpoint.
- When adding a new custom component, prefix the block filename with `custom-` and add the name translation under `names` in the locale file.
- Keep CSS scoped inside `{% stylesheet %}` tags. Do not use Tailwind utility classes.
- When a setting only needs to differ between breakpoints for a practical reason (e.g., size, margins, width), split it. When the difference would rarely matter (e.g., border style, color), keep it shared.
