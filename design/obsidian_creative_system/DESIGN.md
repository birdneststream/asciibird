---
name: Obsidian Creative System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  canvas-ascii:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  panel-width: 280px
---

## Brand & Style

The design system is a minimalist, high-performance interface designed for digital artisans and creative engineers. It prioritizes a "UI as a backdrop" philosophy, where the tool's interface recedes into the background to let the user's work take center stage. 

The aesthetic is **Utilitarian Minimalism** with a technical edge. It leverages a dark, monochromatic base to reduce eye strain during long creative sessions, accented by high-energy colors that signal action and state changes. The atmosphere is professional, precise, and sophisticated—reminiscent of high-end developer environments and professional grading suites. Efficiency is the primary driver; every pixel serves a functional purpose, and visual noise is strictly minimized.

## Colors

The palette is built on a foundation of obsidian and charcoal tones to create deep hierarchy. 
- **Core Backgrounds**: The primary workspace background is the deepest obsidian (#121212), while tool panels and floating containers use a lighter charcoal (#1E1E1E).
- **Accents**: 
    - **Electric Blue** is reserved for primary actions, selection states, and focus indicators.
    - **Cyber Lime** is used sparingly for additive highlights, "active" status indicators, or success messages, providing a high-contrast pop against the dark base.
- **Contrast**: Text and icons leverage varying opacities of white (87% for high emphasis, 60% for medium, 38% for disabled) rather than pure greys to maintain vibrancy.

## Typography

This design system employs a dual-font strategy to distinguish between UI controls and the creative output.
- **UI Typography**: **Inter** is the workhorse for all navigation, labels, and inputs. It provides exceptional legibility at small sizes and a neutral, modern character.
- **Technical Typography**: **JetBrains Mono** is utilized for the ASCII canvas area and technical readouts (e.g., coordinates, hex codes, layer IDs). It ensures that characters align perfectly in a grid, essential for the tool's core functionality.
- **Scale**: Small font sizes (12px-14px) are prioritized to maximize screen real estate for the workspace.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid** model. Side panels (Tools and Properties) are fixed at 280px to ensure predictable control placement, while the central canvas area is fluid to accommodate various viewport sizes.

- **Grid**: A 4px baseline grid governs all internal spacing.
- **Density**: The system uses a high-density spacing model. Standard padding for internal components is 8px (sm), while margins between major containers are 12px (gutter) to maintain a compact, "cockpit" feel.
- **Responsiveness**: On mobile, side panels collapse into bottom sheets or full-screen overlays, and the canvas utilizes pinch-to-zoom for precision.

## Elevation & Depth

In a dark UI, depth is communicated through **Tonal Elevation** and **Subtle Outlines** rather than heavy shadows.

- **Stacking**: Surfaces closer to the user are rendered in lighter shades of charcoal. 
    - Level 0 (Background): #121212
    - Level 1 (Panels): #1E1E1E
    - Level 2 (Modals/Popovers): #2A2A2A
- **Borders**: Each container features a 1px solid border (#333333). This provides crisp definition between panels that might otherwise bleed together in a dark environment.
- **Shadows**: Only Level 2 elements (floating menus) receive a shadow: `0px 4px 12px rgba(0, 0, 0, 0.5)`. The shadow is sharp and tight to maintain the minimalist aesthetic.

## Shapes

The design system uses a consistent **8px (0.5rem) corner radius** for all primary UI components, including buttons, panels, and input fields. 

- **Containers**: Large panels and the main canvas area also utilize the 8px radius to soften the technical edge of the UI.
- **Small Elements**: Tooltips and small icon buttons may scale down to 4px (0.25rem) to maintain visual proportions.
- **Consistency**: Hard corners (0px) are only permitted for the viewport edges or when elements are docked flush against one another.

## Components

- **Buttons**:
    - *Primary*: Solid Electric Blue with white text.
    - *Secondary*: Ghost style with a #333333 border and 60% white text.
    - *Action Icons*: Square 32x32px buttons with 4px radius; Active state uses a subtle Electric Blue glow or Cyber Lime icon tint.
- **Inputs**:
    - Dark fields (#121212) with 1px borders. Focus state triggers a 1px Electric Blue border and a subtle inner glow.
- **Layer List**:
    - Individual layers are separated by thin horizontal lines. The active layer uses a Cyber Lime left-border accent (4px width).
- **Chips/Badges**:
    - Small, pill-shaped indicators with monospaced text for tags or status codes.
- **Canvas Controls**: 
    - Floating toolbars use a semi-transparent version of the #2A2A2A surface with a background blur (8px) to maintain context of the work underneath.
- **Checkboxes/Radios**: 
    - Custom-styled squares with 2px radius; checked state uses Electric Blue fill with a white checkmark.