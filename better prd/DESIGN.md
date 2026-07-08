---
name: Luminous Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434934'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737a61'
  outline-variant: '#c3caad'
  surface-tint: '#4b6700'
  primary: '#4b6700'
  on-primary: '#ffffff'
  primary-container: '#baf91a'
  on-primary-container: '#517000'
  inverse-primary: '#a0d800'
  secondary: '#5b5e66'
  on-secondary: '#ffffff'
  secondary-container: '#dfe2eb'
  on-secondary-container: '#61646c'
  tertiary: '#586152'
  on-tertiary: '#ffffff'
  tertiary-container: '#dfe8d5'
  on-tertiary-container: '#60695a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8f615'
  primary-fixed-dim: '#a0d800'
  on-primary-fixed: '#141f00'
  on-primary-fixed-variant: '#374e00'
  secondary-fixed: '#dfe2eb'
  secondary-fixed-dim: '#c3c6cf'
  on-secondary-fixed: '#181c22'
  on-secondary-fixed-variant: '#43474e'
  tertiary-fixed: '#dce5d3'
  tertiary-fixed-dim: '#c0c9b8'
  on-tertiary-fixed: '#161e12'
  on-tertiary-fixed-variant: '#41493c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

This design system embodies a "Luminous High-Tech" aesthetic, blending the clinical precision of a modern SaaS platform with the organic, energetic glow of a cutting-edge AI interface. The brand personality is innovative, professional, and vibrant—aimed at power users who value data density and aesthetic sophistication.

The visual style is a hybrid of **Glassmorphism** and **Corporate Modernism**. It moves away from sterile white interfaces toward a multi-layered, atmospheric environment. Key characteristics include semi-transparent surfaces, delicate monochromatic borders, and a primary emphasis on "light-as-material," where the neon green primary color acts as both a functional indicator and a source of ambient illumination.

## Colors

The palette is anchored by a high-visibility **Neon Green (#BAF91A)** used exclusively for primary actions and active states. To avoid a "plain white" feel, the background canvas uses a soft, tinted off-white (#F8FAF5) that harmonizes with the lime accents. 

Strategic use of a deep, almost-black secondary color provides high-contrast grounding for primary dashboard elements, while the tertiary mint-white is used for large-scale luminous gradients. Shadows are not neutral grey but are subtly tinted with the primary hue to maintain the "glow" effect.

## Typography

The typographic hierarchy utilizes three distinct fonts to balance readability with technical flair. **Manrope** provides a modern, geometric foundation for headlines. **Hanken Grotesk** is used for body content due to its high legibility and contemporary character. **JetBrains Mono** is employed for data labels, metadata, and numerical values to reinforce the analytical, developer-centric nature of the interface.

On mobile, display sizes scale down aggressively to maintain information density without sacrificing clarity. All labels use uppercase tracking to differentiate them from interactive body text.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile devices. The spacing rhythm is based on a strict 8px baseline, ensuring all components align to a predictable mathematical grid. 

Margins and gutters are generous to allow the "glass" containers breathing room and to prevent the luminous background gradients from feeling cluttered. Elements should rely on logical grouping within cards rather than heavy divider lines.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and tonal layering rather than traditional heavy shadows.

1.  **Level 0 (Canvas):** The base background featuring soft, mesh gradients of #F0F9E6 and #FFFFFF.
2.  **Level 1 (Surface):** Semi-transparent white containers (70% opacity) with a `backdrop-filter: blur(12px)`.
3.  **Level 2 (Active/Hover):** Increased opacity and a subtle, lime-tinted ambient shadow (`box-shadow: 0 10px 30px rgba(186, 249, 26, 0.1)`).
4.  **Borders:** All containers must have a 1px solid border at 10% opacity white or light grey to define edges against the luminous background.

## Shapes

The shape language is consistently "Rounded," favoring approachable geometry that contrasts with the technical typography. Main layout cards and primary buttons utilize a 1rem (16px) corner radius. Small interactive elements like chips and tags should use fully rounded (pill-shaped) ends to signify their interactive nature.

## Components

### Buttons
Primary buttons use the Neon Green (#BAF91A) background with black text. They feature a subtle inner glow and a slight lift effect on hover. Secondary buttons should be glass-based with a thin border.

### Cards
Cards are the primary organizational unit. They must utilize the backdrop blur effect and a 1px light border. For "Featured" cards, a faint green gradient can be applied to the bottom-right corner of the container.

### Input Fields
Inputs should be minimal—bottom-border only or very light grey fills. When focused, the border transitions to primary green with a soft outer glow.

### Chips & Badges
Small, high-contrast elements. Use primary green for "positive" or "active" states and the dark secondary color for neutral metadata.

### Navigation
The sidebar should feel lighter than the main content, using a transparent background and highlighting the active state with a luminous green pill and a small glow-shadow.