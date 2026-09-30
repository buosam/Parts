---
name: ui-design-system
description: >-
  Professional toolkit for creating and maintaining scalable design systems.
  Use when generating design tokens (colors, typography, 8pt spacing grid, elevation, motion),
  architecting reusable component systems, enforcing WCAG accessibility compliance,
  or producing design token handoff files in CSS, SCSS, or JSON.
license: Apache-2.0
metadata:
  version: v1.0.0
  author: Design System Architect
---

# UI Design System Skill

Professional toolkit for creating, maintaining, and scaling design systems across modern web and mobile applications.

## Core Capabilities

1. **Design Token Generation**: Algorithmic generation of cohesive color ramps (50–950), semantic aliases, and elevation tokens from a single brand color.
2. **Component System Architecture**: 3-tier token hierarchy (Global $\rightarrow$ Semantic $\rightarrow$ Component) for zero-drift theming.
3. **8pt Spacing Grid & Modular Typography**: Mathematical scale calculation adhering to *The Elements of Typographic Style*.
4. **WCAG Accessibility Compliance**: Built-in relative luminance and contrast ratio checking ($\ge 4.5:1$ for body, $\ge 3:1$ for UI components).
5. **Developer Handoff Formats**: Exportable as CSS Custom Properties, SCSS variables, or W3C DTCG-compliant JSON.

---

## Key Scripts

### `design_token_generator.py`

Generates complete, mathematically balanced design system tokens from brand colors.

#### Usage
```bash
python scripts/design_token_generator.py [brand_color] [style] [format]
```

*   **`brand_color`**: Any valid Hex color code (e.g. `#2554d7`, `#059669`, `#d9730d`).
*   **`style`**:
    *   `modern` (default): Crisp geometric lines, high-contrast dark/light planes, 1.25 Major Third type scale, fast cubic-bezier micro-transitions.
    *   `classic`: Warm harmonious neutrals, 1.333 Perfect Fourth type scale, graceful elevation, refined serif/sans hierarchy.
    *   `playful`: Saturated accents, bouncy spring animations, rounded pill radii, punchy high-energy weights.
*   **`format`**:
    *   `css`: Modern CSS Custom Properties (`:root { ... }`).
    *   `json`: W3C Design Tokens Community Group / Style Dictionary compatible JSON.
    *   `scss`: SCSS variables (`$color-primary-500: ...`).

#### Examples
```bash
# Generate modern CSS variables for a technical blueprint brand
python scripts/design_token_generator.py #2554d7 modern css

# Generate playful JSON tokens for design tool sync
python scripts/design_token_generator.py #fd660e playful json --output tokens.json

# Generate classic SCSS tokens
python scripts/design_token_generator.py #059669 classic scss --output _tokens.scss
```

---

## Token Architecture Overview

The generated token hierarchy follows the 3-Tier Enterprise Token Standard:

```text
Tier 1: Global / Primitive Tokens
└── Raw values: colors (blue-500: #2554d7), spacing (space-4: 16px), type (size-base: 1rem)
       │
       ▼
Tier 2: Semantic / Alias Tokens
└── Contextual meaning: color-bg-surface, color-text-primary, color-interactive-focus
       │
       ▼
Tier 3: Component Tokens
└── Component-scoped: button-primary-bg, modal-elevation-shadow, input-border-radius
```

---

## Reference Guides

*   [**`token_architecture.md`**](./references/token_architecture.md): In-depth guide on multi-brand theming, token naming taxonomy, and Style Dictionary integration.
*   [**`accessibility_compliance.md`**](./references/accessibility_compliance.md): WCAG 2.1 AA/AAA contrast calculation, focus management, and fluid responsive design principles.
