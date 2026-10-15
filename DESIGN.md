# Design

Source of truth for brand rules: ../docs/VISUAL_IDENTITY_GUIDE.md. Structure inspired by the AppDrop Framer template (sticky nav, large-type hero with phone mock, statement band, benefits, feature split, fees, FAQ accordion, step CTA), re-skinned for Inzerv.

## Color strategy
Committed: white and #F5F7F9 surfaces carry most of the page; Navy drenches the statement band, step CTA and footer; Turquoise is reserved for primary action, active state, and icons. Turquoise is never used as text on light backgrounds (fails contrast); it is text only on Navy.

## Tokens (see src/app/globals.css)
- navy #062544, navy-deep #031A30, turquoise #10B7BE, white, bg-light #F5F7F9
- ink-muted #4A5D6E (body-secondary on light, 6.5:1), text-secondary #667785 (large or decorative only)
- line #DDE4EA hairlines, functional colors per guide
- radius: buttons and inputs 12px, cards and modals 16px
- spacing: 4/8/16/24/32/48 base; section rhythm varies (96, 128, 72)

## Type
Hero 44 to 72px / 600 / -0.02em (Latin only; Arabic tracking 0). Section titles 32 to 44. Body 16/24, max 68ch. Labels 14/500.

## Components
- Primary button: turquoise bg, navy text, 12px radius, 48px min height.
- Secondary: navy outline on light, white outline on navy.
- Phone mock: the only elevated object on the page.
- Fees list, FAQ (native details), step list. No identical icon-card grids.

## Motion
CSS scroll-driven fade/translate (opacity + transform only), 300ms-equivalent, ease-out. Disabled under prefers-reduced-motion. No loops.
