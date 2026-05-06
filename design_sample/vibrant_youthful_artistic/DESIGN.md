---
name: Vibrant Youthful Artistic
colors:
  surface: '#fbf8ff'
  surface-dim: '#dbd9e1'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fa'
  surface-container: '#efedf5'
  surface-container-high: '#e9e7ef'
  surface-container-highest: '#e3e1e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#494553'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f8'
  outline: '#7a7485'
  outline-variant: '#cbc3d5'
  surface-tint: '#6844c7'
  primary: '#6844c7'
  on-primary: '#ffffff'
  primary-container: '#9d7bff'
  on-primary-container: '#320085'
  inverse-primary: '#cebdff'
  secondary: '#8a4778'
  on-secondary: '#ffffff'
  secondary-container: '#fcaae2'
  on-secondary-container: '#7b3969'
  tertiary: '#006d36'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a856'
  on-tertiary-container: '#003315'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#5028ae'
  secondary-fixed: '#ffd7ef'
  secondary-fixed-dim: '#ffade4'
  on-secondary-fixed: '#3a0031'
  on-secondary-fixed-variant: '#6f2f5f'
  tertiary-fixed: '#6dfe9c'
  tertiary-fixed-dim: '#4de082'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005227'
  background: '#fbf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e3e1e9'
typography:
  display-lg:
    fontFamily: Spline Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Spline Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1120px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built to reflect the creative world of a 10th-grade girl, balancing youthful energy with a polished, artistic sensibility. The personality is expressive, imaginative, and welcoming—avoiding the clinical feel of standard portfolios in favor of a "digital scrapbook" vibe.

The aesthetic blends **Glassmorphism** with **Tactile** elements. We use soft, translucent layers to maintain a modern feel, while incorporating "squishy" interactive states and organic patterns that feel hand-drawn or DIY. The goal is to evoke a sense of curiosity and play, mirroring the act of making music or art.

## Colors

The palette is centered around an energetic lavender (#9D7BFF) that serves as the primary brand anchor. To keep the feel "vibrant," a secondary bubblegum pink is used for highlights, while a soft "croc-green" tertiary shade is reserved for specialized accents and patterns. 

Backgrounds are kept light and airy using a tinted off-white (#F9F7FF) to ensure the purple accents pop without feeling heavy. Text uses a deep violet-tinted charcoal rather than pure black to maintain the color story throughout the interface.

## Typography

This design system utilizes **Spline Sans** for headlines to provide a fresh, dynamic, and slightly geometric character that feels creative. For the body text, **Plus Jakarta Sans** is selected for its friendly, rounded terminals and high readability, ensuring the site feels approachable.

Large display type should be used generously for section headers to create a bold, editorial feel. Letter spacing is slightly tightened on headlines to give them a punchy, contemporary look.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to allow the content to "breathe," echoing a clean art gallery or a minimalist sketchbook. We use an 8px base unit for all spacing to ensure a consistent rhythmic flow.

Elements are often offset or staggered slightly to break the rigid "corporate" grid, creating a more organic and playful flow. Large white spaces are encouraged to frame the user’s creative projects.

## Elevation & Depth

Visual hierarchy is achieved through **Glassmorphism** and **Ambient Shadows**. Instead of traditional harsh shadows, this design system uses soft, diffused "glow" shadows tinted with the primary purple color. 

Floating elements like cards and modals should feature a subtle backdrop blur (12px–20px) and a thin, semi-transparent white border (1px) to simulate a frosted acrylic surface. This adds a layer of depth that feels light and modern rather than heavy or dated.

## Shapes

The shape language is extremely soft and "squishy." A **Pill-shaped (3)** setting is applied to the majority of interactive elements. Sharp corners are avoided entirely to maintain a friendly and safe atmosphere.

Incorporate stylized "crocodile scale" shapes—simplified as rounded hexagons or soft organic blobs—as background floating elements or as a repeating pattern inside buttons and headers. These should be subtle, using low-contrast tonal variations of the background colors.

## Components

- **Buttons:** Use pill-shaped containers with a slight vertical gradient. The "Primary" button features a bounce animation on hover to increase the playful feel.
- **Cards:** Glassmorphic cards with rounded-xl corners (32px). Use a subtle crocodile-scale pattern mask in the corner of the card to add texture.
- **Chips/Tags:** Small, fully rounded capsules used for categorizing "Art," "Music," or "Projects." Use high-contrast pastel colors.
- **Input Fields:** Large, rounded text fields with a soft purple focus ring. The placeholder text should be conversational.
- **Interactive Accents:** Small, stylized crocodile "eyes" or "scales" that appear as cursor followers or loading indicators.
- **Audio Player:** A custom-styled music widget with a "blob" shaped waveform, utilizing the secondary pink and primary purple.