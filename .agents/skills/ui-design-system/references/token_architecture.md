# Design Token Architecture & Multi-Theme System

Comprehensive guide for architecting, naming, and distributing enterprise design tokens.

---

## 1. The Three-Tier Token Hierarchy

Design tokens bridge the gap between design tools (Figma) and codebases (React, CSS, iOS, Android). A production design system organizes tokens into three distinct tiers:

```text
[ Tier 1: Global / Primitive Tokens ]
├── Pure raw values: colors, raw rems, bezier curves
│   Examples: blue-500: #2554d7, space-4: 1rem, radius-lg: 8px
│
▼
[ Tier 2: Semantic / Alias Tokens ]
├── Purpose & Context: theme-aware, mode-swappable
│   Examples: bg-surface, text-primary, border-focus, action-active
│
▼
[ Tier 3: Component-Scoped Tokens ]
└── Component-specific styling bindings
    Examples: button-primary-bg, modal-header-border, input-placeholder-color
```

---

## 2. Token Taxonomy & Naming Convention

Follow the standard BEM-inspired token taxonomy:

$$\text{Category} - \text{Concept} - \text{Property} - \text{Variant} - \text{State}$$

| Token Example | Category | Concept | Property | Variant | State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-action-primary-hover` | `color` | `action` | background | `primary` | `hover` |
| `--font-heading-display-lg` | `font` | `heading` | size | `display` | `lg` |
| `--space-inset-card-sm` | `space` | `inset` | padding | `card` | `sm` |
| `--border-focus-ring-width` | `border` | `focus` | ring width | `default` | `active` |

---

## 3. Dark Mode & Multi-Brand Theming

Never duplicate primitive scales across themes. Instead, map the same semantic tokens to different primitive tokens based on the theme context:

```css
/* Light Theme Defaults */
:root {
  --color-bg-canvas: var(--color-neutral-50);
  --color-bg-surface: #ffffff;
  --color-text-primary: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border-subtle: var(--color-neutral-200);
}

/* Dark Theme Overrides */
[data-theme="dark"], .dark {
  --color-bg-canvas: #0d111a;
  --color-bg-surface: #151d2a;
  --color-text-primary: #f3f6fa;
  --color-text-muted: #94a3b8;
  --color-border-subtle: rgba(255, 255, 255, 0.08);
}
```

---

## 4. Tailwind CSS Token Integration

Exported tokens can be directly referenced in modern Tailwind configurations:

```javascript
// tailwind.config.js or @theme block
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          900: 'var(--color-primary-900)',
        },
        surface: 'var(--color-bg-surface)',
        canvas: 'var(--color-bg-canvas)',
      },
      fontFamily: {
        display: ['var(--font-family-display)'],
        body: ['var(--font-family-body)'],
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
      },
    },
  },
};
```
