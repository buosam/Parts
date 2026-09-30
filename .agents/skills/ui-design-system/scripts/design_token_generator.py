#!/usr/bin/env python3
"""
Senior UI Design System - Design Token Generator
Algorithmic token engine creating cohesive color ramps, modular typography scales,
8pt spacing grids, and elevation systems from any brand color.
"""

import sys
import os
import json
import math
import argparse
from typing import Dict, List, Tuple, Any

# Ensure Windows terminal handles UTF-8 output gracefully
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    hex_clean = hex_str.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = "".join([c*2 for c in hex_clean])
    return int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)

def rgb_to_hex(r: int, g: int, b: int) -> str:
    r_c = max(0, min(255, round(r)))
    g_c = max(0, min(255, round(g)))
    b_c = max(0, min(255, round(b)))
    return f"#{r_c:02x}{g_c:02x}{b_c:02x}"

def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    r_p = r / 255.0
    g_p = g / 255.0
    b_p = b / 255.0
    c_max = max(r_p, g_p, b_p)
    c_min = min(r_p, g_p, b_p)
    delta = c_max - c_min

    # Lightness
    l = (c_max + c_min) / 2.0

    # Saturation
    if delta == 0:
        s = 0.0
        h = 0.0
    else:
        s = delta / (1.0 - abs(2.0 * l - 1.0))
        if c_max == r_p:
            h = 60.0 * (((g_p - b_p) / delta) % 6.0)
        elif c_max == g_p:
            h = 60.0 * (((b_p - r_p) / delta) + 2.0)
        else:
            h = 60.0 * (((r_p - g_p) / delta) + 4.0)

    if h < 0:
        h += 360.0
    return h, s, l

def hsl_to_rgb(h: float, s: float, l: float) -> Tuple[int, int, int]:
    c = (1.0 - abs(2.0 * l - 1.0)) * s
    x = c * (1.0 - abs((h / 60.0) % 2.0 - 1.0))
    m = l - c / 2.0

    if 0 <= h < 60:
        r_p, g_p, b_p = c, x, 0
    elif 60 <= h < 120:
        r_p, g_p, b_p = x, c, 0
    elif 120 <= h < 180:
        r_p, g_p, b_p = 0, c, x
    elif 180 <= h < 240:
        r_p, g_p, b_p = 0, x, c
    elif 240 <= h < 300:
        r_p, g_p, b_p = x, 0, c
    else:
        r_p, g_p, b_p = c, 0, x

    r = (r_p + m) * 255.0
    g = (g_p + m) * 255.0
    b = (b_p + m) * 255.0
    return round(r), round(g), round(b)

def get_relative_luminance(r: int, g: int, b: int) -> float:
    def transform(c: int) -> float:
        c_p = c / 255.0
        return c_p / 12.92 if c_p <= 0.03928 else ((c_p + 0.055) / 1.055) ** 2.4
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)

def get_contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = get_relative_luminance(*hex_to_rgb(hex1))
    l2 = get_relative_luminance(*hex_to_rgb(hex2))
    light = max(l1, l2)
    dark = min(l1, l2)
    return round((light + 0.05) / (dark + 0.05), 2)

class DesignTokenGenerator:
    def __init__(self, brand_color: str, style: str = 'modern'):
        self.brand_color = brand_color
        self.style = style.lower() if style else 'modern'
        if self.style not in ('modern', 'classic', 'playful'):
            self.style = 'modern'

        self.r, self.g, self.b = hex_to_rgb(self.brand_color)
        self.h, self.s, self.l = rgb_to_hsl(self.r, self.g, self.b)

    def generate_color_palette(self) -> Dict[str, Dict[str, str]]:
        # Tonal stops from 50 to 950
        stops = {
            '50':  {'l': 0.96, 's_mult': 0.85},
            '100': {'l': 0.91, 's_mult': 0.90},
            '200': {'l': 0.82, 's_mult': 0.95},
            '300': {'l': 0.71, 's_mult': 0.98},
            '400': {'l': 0.58, 's_mult': 1.00},
            '500': {'l': max(0.40, min(0.50, self.l)), 's_mult': 1.00}, # Base primary
            '600': {'l': 0.40, 's_mult': 1.02},
            '700': {'l': 0.31, 's_mult': 1.05},
            '800': {'l': 0.22, 's_mult': 1.08},
            '900': {'l': 0.14, 's_mult': 1.10},
            '950': {'l': 0.08, 's_mult': 1.12},
        }

        primary_ramp = {}
        for stop, config in stops.items():
            s_target = min(1.0, self.s * config['s_mult'])
            r, g, b = hsl_to_rgb(self.h, s_target, config['l'])
            primary_ramp[stop] = rgb_to_hex(r, g, b)

        # Style-Specific Neutral Ramp
        if self.style == 'classic':
            # Warm Stone / Slate
            neutral_ramp = {
                '50': '#fafaf9', '100': '#f5f5f4', '200': '#e7e5e4',
                '300': '#d6d3d1', '400': '#a8a29e', '500': '#78716c',
                '600': '#57534e', '700': '#44403c', '800': '#292524',
                '900': '#1c1917', '950': '#0c0a09'
            }
        elif self.style == 'playful':
            # Vibrant Cool Slate
            neutral_ramp = {
                '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0',
                '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b',
                '600': '#475569', '700': '#334155', '800': '#1e293b',
                '900': '#0f172a', '950': '#020617'
            }
        else: # modern
            # Machined Chassis Iron / Slate
            neutral_ramp = {
                '50': '#f3f6fa', '100': '#e5eaf2', '200': '#c8d3e2',
                '300': '#9eb0ca', '400': '#6f86a8', '500': '#4c6282',
                '600': '#384a65', '700': '#263449', '800': '#1c2637',
                '900': '#151d2a', '950': '#0d111a'
            }

        # Semantic Accents (WCAG Calibrated)
        semantic = {
            'success': {'base': '#059669', 'bg': '#ecfdf5', 'text': '#065f46'},
            'warning': {'base': '#d9730d', 'bg': '#fffbeb', 'text': '#92400e'},
            'danger':  {'base': '#dc2626', 'bg': '#fef2f2', 'text': '#991b1b'},
            'info':    {'base': primary_ramp['600'], 'bg': primary_ramp['50'], 'text': primary_ramp['900']},
        }

        return {
            'primary': primary_ramp,
            'neutral': neutral_ramp,
            'semantic': semantic
        }

    def generate_typography(self) -> Dict[str, Any]:
        # Modular scale ratios
        ratio_map = {
            'modern': 1.25,     # Major Third (clean, structured)
            'classic': 1.333,   # Perfect Fourth (dynamic, high-contrast)
            'playful': 1.20,    # Minor Third (compact, punchy)
        }
        ratio = ratio_map[self.style]
        base_px = 16.0

        def step(power: float) -> Tuple[str, str]:
            px = base_px * (ratio ** power)
            rem = round(px / 16.0, 4)
            # Associated line-height
            lh = 1.15 if px >= 36 else (1.25 if px >= 24 else (1.4 if px >= 18 else 1.5))
            return f"{rem}rem", str(lh)

        scale = {
            'xs':   step(-2),
            'sm':   step(-1),
            'base': step(0),
            'md':   step(1),
            'lg':   step(2),
            'xl':   step(3),
            '2xl':  step(4),
            '3xl':  step(5),
            '4xl':  step(6),
            '5xl':  step(7),
        }

        font_families = {
            'modern': {
                'display': "'Space Grotesk', system-ui, sans-serif",
                'body': "'Plus Jakarta Sans', system-ui, sans-serif",
                'code': "'JetBrains Mono', monospace"
            },
            'classic': {
                'display': "'Playfair Display', Georgia, serif",
                'body': "'Source Serif 4', Georgia, serif",
                'code': "'Source Code Pro', monospace"
            },
            'playful': {
                'display': "'Outfit', system-ui, sans-serif",
                'body': "'Inter', system-ui, sans-serif",
                'code': "'Fira Code', monospace"
            }
        }

        return {
            'ratio': ratio,
            'scale': scale,
            'families': font_families[self.style]
        }

    def generate_spacing_grid(self) -> Dict[str, str]:
        # 8pt Mathematical Grid
        return {
            'space-0': '0',
            'space-1': '0.25rem',  # 4px
            'space-2': '0.5rem',   # 8px
            'space-3': '0.75rem',  # 12px
            'space-4': '1rem',     # 16px
            'space-5': '1.25rem',  # 20px
            'space-6': '1.5rem',   # 24px
            'space-8': '2rem',     # 32px
            'space-10': '2.5rem',  # 40px
            'space-12': '3rem',    # 48px
            'space-16': '4rem',    # 64px
            'space-20': '5rem',    # 80px
            'space-24': '6rem',    # 96px
        }

    def generate_radii(self) -> Dict[str, str]:
        if self.style == 'modern':
            return {'none': '0', 'xs': '2px', 'sm': '4px', 'md': '6px', 'lg': '8px', 'xl': '12px', 'full': '9999px'}
        elif self.style == 'classic':
            return {'none': '0', 'xs': '1px', 'sm': '2px', 'md': '4px', 'lg': '6px', 'xl': '8px', 'full': '9999px'}
        else: # playful
            return {'none': '0', 'xs': '4px', 'sm': '8px', 'md': '12px', 'lg': '16px', 'xl': '24px', 'full': '9999px'}

    def generate_elevation(self) -> Dict[str, str]:
        if self.style == 'modern':
            return {
                'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
                'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',
                'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.35)',
            }
        elif self.style == 'classic':
            return {
                'shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
                'shadow-md': '0 4px 8px rgba(0, 0, 0, 0.1)',
                'shadow-lg': '0 12px 20px rgba(0, 0, 0, 0.12)',
                'shadow-xl': '0 24px 36px rgba(0, 0, 0, 0.15)',
            }
        else: # playful
            return {
                'shadow-sm': '0 2px 0 rgba(0, 0, 0, 0.12)',
                'shadow-md': '0 6px 12px -2px rgba(0, 0, 0, 0.15)',
                'shadow-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.2)',
                'shadow-xl': '0 20px 32px -6px rgba(0, 0, 0, 0.25)',
            }

    def generate_motion(self) -> Dict[str, str]:
        return {
            'duration-fast': '100ms',
            'duration-normal': '200ms',
            'duration-slow': '350ms',
            'ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
            'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
            'ease-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        }

    def generate_breakpoints(self) -> Dict[str, str]:
        return {
            'screen-sm': '640px',
            'screen-md': '768px',
            'screen-lg': '1024px',
            'screen-xl': '1280px',
            'screen-2xl': '1536px',
        }

    # Formatters
    def to_css(self) -> str:
        colors = self.generate_color_palette()
        type_system = self.generate_typography()
        spacing = self.generate_spacing_grid()
        radii = self.generate_radii()
        elevation = self.generate_elevation()
        motion = self.generate_motion()
        breakpoints = self.generate_breakpoints()

        lines = []
        lines.append("/**")
        lines.append(f" * Design Tokens: {self.brand_color} ({self.style.capitalize()} Style)")
        lines.append(" * Generated by Senior UI Design System Engine")
        lines.append(" */\n")
        lines.append(":root {")

        # Color Tokens
        lines.append("  /* --- Colors: Primary Brand Ramp --- */")
        for stop, val in colors['primary'].items():
            contrast_w = get_contrast_ratio(val, '#ffffff')
            lines.append(f"  --color-primary-{stop}: {val}; /* vs White: {contrast_w}:1 */")

        lines.append("\n  /* --- Colors: Neutrals --- */")
        for stop, val in colors['neutral'].items():
            lines.append(f"  --color-neutral-{stop}: {val};")

        lines.append("\n  /* --- Colors: Semantic --- */")
        for sem, vals in colors['semantic'].items():
            lines.append(f"  --color-{sem}: {vals['base']};")
            lines.append(f"  --color-{sem}-bg: {vals['bg']};")
            lines.append(f"  --color-{sem}-text: {vals['text']};")

        # Typography Tokens
        lines.append("\n  /* --- Typography: Font Families --- */")
        for k, v in type_system['families'].items():
            lines.append(f"  --font-family-{k}: {v};")

        lines.append("\n  /* --- Typography: Modular Scale --- */")
        for k, (rem, lh) in type_system['scale'].items():
            lines.append(f"  --font-size-{k}: {rem};")
            lines.append(f"  --line-height-{k}: {lh};")

        # Spacing Grid
        lines.append("\n  /* --- 8pt Spacing Grid --- */")
        for k, v in spacing.items():
            lines.append(f"  --{k}: {v};")

        # Radii
        lines.append("\n  /* --- Border Radii --- */")
        for k, v in radii.items():
            lines.append(f"  --radius-{k}: {v};")

        # Elevation
        lines.append("\n  /* --- Elevation & Shadows --- */")
        for k, v in elevation.items():
            lines.append(f"  --{k}: {v};")

        # Motion
        lines.append("\n  /* --- Motion & Transitions --- */")
        for k, v in motion.items():
            lines.append(f"  --transition-{k}: {v};")

        # Breakpoints
        lines.append("\n  /* --- Responsive Breakpoints --- */")
        for k, v in breakpoints.items():
            lines.append(f"  --breakpoint-{k}: {v};")

        lines.append("}\n")
        return "\n".join(lines)

    def to_scss(self) -> str:
        css_content = self.to_css()
        # Convert CSS Custom Properties to SCSS variables
        scss_lines = []
        for line in css_content.splitlines():
            if line.startswith(":root {") or line.startswith("}"):
                continue
            if line.strip().startswith("--"):
                # e.g.   --color-primary-500: #2554d7;
                clean = line.strip().lstrip("-").lstrip("-")
                key, val = clean.split(":", 1)
                scss_lines.append(f"${key.strip()}: {val.strip()}")
            else:
                scss_lines.append(line)
        return "\n".join(scss_lines) + "\n"

    def to_json(self) -> str:
        colors = self.generate_color_palette()
        type_system = self.generate_typography()
        spacing = self.generate_spacing_grid()
        radii = self.generate_radii()
        elevation = self.generate_elevation()
        motion = self.generate_motion()
        breakpoints = self.generate_breakpoints()

        dtcg_tokens = {
            "$schema": "https://design-tokens.github.io/community-group/spec/",
            "brand": {
                "color": self.brand_color,
                "style": self.style
            },
            "color": {
                "primary": {k: {"$value": v, "$type": "color"} for k, v in colors['primary'].items()},
                "neutral": {k: {"$value": v, "$type": "color"} for k, v in colors['neutral'].items()},
                "semantic": {k: {prop: {"$value": val, "$type": "color"} for prop, val in vals.items()} for k, vals in colors['semantic'].items()}
            },
            "typography": {
                "fontFamily": {k: {"$value": v, "$type": "fontFamily"} for k, v in type_system['families'].items()},
                "fontSize": {k: {"$value": rem, "$type": "dimension"} for k, (rem, _) in type_system['scale'].items()},
                "lineHeight": {k: {"$value": lh, "$type": "number"} for k, (_, lh) in type_system['scale'].items()}
            },
            "spacing": {k: {"$value": v, "$type": "dimension"} for k, v in spacing.items()},
            "borderRadius": {k: {"$value": v, "$type": "dimension"} for k, v in radii.items()},
            "shadow": {k: {"$value": v, "$type": "shadow"} for k, v in elevation.items()},
            "motion": {k: {"$value": v, "$type": "duration" if "duration" in k else "cubicBezier"} for k, v in motion.items()},
            "breakpoint": {k: {"$value": v, "$type": "dimension"} for k, v in breakpoints.items()}
        }
        return json.dumps(dtcg_tokens, indent=2)

def main():
    parser = argparse.ArgumentParser(description="Professional Design Token Generator")
    parser.add_argument("brand_color", nargs="?", default="#2554d7", help="Base brand hex color (e.g. #2554d7)")
    parser.add_argument("style", nargs="?", default="modern", choices=['modern', 'classic', 'playful'], help="Design style aesthetic")
    parser.add_argument("format", nargs="?", default="css", choices=['css', 'scss', 'json'], help="Export format")
    parser.add_argument("--output", "-o", help="Save tokens to file")

    args = parser.parse_args()

    # Normalize hex
    brand_color = args.brand_color
    if not brand_color.startswith('#'):
        brand_color = f"#{brand_color}"

    generator = DesignTokenGenerator(brand_color, style=args.style)

    if args.format == 'json':
        output = generator.to_json()
    elif args.format == 'scss':
        output = generator.to_scss()
    else:
        output = generator.to_css()

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"[+] Design tokens ({args.style}, {args.format}) successfully exported to: {args.output}")
    else:
        print(output)

if __name__ == "__main__":
    main()
