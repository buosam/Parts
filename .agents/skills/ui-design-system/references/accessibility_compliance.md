# Design System Accessibility (WCAG 2.1 AA/AAA) Guide

Comprehensive engineering reference for accessibility compliance in modern design systems.

---

## 1. Contrast Ratios (WCAG 2.1 Criteria 1.4.3 & 1.4.11)

Contrast is calculated using Relative Luminance ($L$):

$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \quad (\text{where } L_1 > L_2)$$

### Minimum Compliance Thresholds
*   **Normal Body Text ($< 18\text{pt}$ or $< 14\text{pt}$ bold)**:
    *   **Level AA**: $\ge 4.5:1$
    *   **Level AAA**: $\ge 7:1$
*   **Large Display Text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold)**:
    *   **Level AA**: $\ge 3:1$
    *   **Level AAA**: $\ge 4.5:1$
*   **User Interface Components & Graphical Objects (Inputs, Icons, Borders)**:
    *   **Level AA**: $\ge 3:1$ against adjacent colors.

---

## 2. Visible Focus Indicators (WCAG 2.4.7 & 2.4.11)

Never remove outlines with `outline: none` without providing an equal or superior visible alternative.

### Accessible Dual-Ring Focus Pattern
A 2-layer ring ensures focus is visible on both dark and light surfaces:

```css
/* Universal Accessible Focus Indicator */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg-canvas), 0 0 0 4px var(--color-primary-500);
}
```

---

## 3. Touch Targets (WCAG 2.5.5 & 2.5.8)

*   **Pointer Target Size**: Minimum interactive bounding box must be at least **$44 \times 44\text{px}$** (or $24 \times 24\text{px}$ with sufficient spacing).
*   Add `touch-action: manipulation` to prevent 300ms double-tap delay on mobile devices.

```css
button, a, input, select {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}
```

---

## 4. Respecting User Motion Preferences (WCAG 2.3.3)

Users with vestibular disorders require immediate suppression of parallax, vestibular bounce, or large layout translations:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Fluid Typography & Modular Scales

Instead of jumping across arbitrary breakpoints, fluid scales interpolate typography smoothly:

```css
:root {
  /* Fluid Display Headline: clamp(min, preferred, max) */
  --font-size-hero: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  --font-size-body: clamp(0.9375rem, 0.875rem + 0.3vw, 1.0625rem);
}
```
