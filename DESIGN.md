# COIREA Living System

## Theme

A light, organic interface for senior leaders reviewing organizational health in a calm daylight setting. The atmosphere is natural and reflective, while product surfaces remain precise and credible.

## Color

- Forest: `oklch(0.30 0.055 150)`
- Deep Forest: `oklch(0.21 0.045 153)`
- Moss: `oklch(0.48 0.065 142)`
- Sage: `oklch(0.72 0.035 145)`
- Pearl: `oklch(0.965 0.012 92)`
- Warm Paper: `oklch(0.925 0.018 83)`
- Mineral Gold: `oklch(0.68 0.075 77)`
- Ink: `oklch(0.25 0.025 151)`

## Typography

- Display: Bodoni Moda, high-contrast serif used for major brand statements.
- Interface and body: Manrope, warm geometric sans used for readable explanations and product UI.
- Body copy is 16 to 18px with a maximum line length near 68 characters.

## Layout

- Asymmetric hero with editorial copy and a substantial product visualization.
- Alternating full-width fields, split layouts, and product evidence.
- Fluid spacing using `clamp()`.
- Rounded corners are restrained and used mainly for interactive product surfaces.

## Components

- Forest primary buttons with clear hover and press feedback.
- Warm-paper product panels with fine mineral borders.
- Data visualizations use forest, sage, and mineral gold.
- Chat assistant appears as a purposeful product surface rather than a generic bubble.

## Motion

- One orchestrated hero entrance.
- Slow background parallax and gently rotating system visualization.
- Scroll-triggered section reveals.
- Diagnostic and chat state changes use 180 to 300ms transitions.
- All motion respects `prefers-reduced-motion`.
