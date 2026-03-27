# OHMAZE Brand Identity Guide

*Created: 2026-03-26*
*Brand: OHMAZE*
*Domain: ohmaze.com / ohmaze.ca (pending confirmation)*

---

## Brand Overview

| Item | Value |
|------|-------|
| **Name** | OHMAZE |
| **Display** | OHMAZE (all caps) |
| **Pronunciation** | /oʊ meɪz/ — "oh-maze" |
| **Meaning** | Oh (exclamation/aha moment) + Maze (regulatory maze) |
| **Tagline** | TBD |
| **Personality** | Friendly, Practical, Startup-energy, Tech-savvy |
| **Tone** | Professional but not stiff. Clear, no-fluff, approachable |

---

## Logo

### Symbol: Lightbulb + Maze Path

- **Concept**: Classic lightbulb silhouette with maze pattern inside. One maze path serves as the filament.
- **Meaning**: Lightbulb (idea/aha) + Maze (complex regulations) = "Finding the answer inside regulatory complexity"
- **Connection**: "Oh!" exclamation links naturally to the lightbulb aha moment
- **Type**: Symbol + Wordmark (horizontal and vertical layouts)

### Logo Variations
1. **Full**: Symbol + OHMAZE wordmark (primary)
2. **Compact**: Symbol only (favicon, app icon)
3. **Text only**: OHMAZE wordmark (inline, footer)

### Logo Font
- **Wordmark**: Outfit, weight 700-900
- **Letter spacing**: +2% tracking for all-caps display

---

## Color Palette: Tech-Forward Blue

### Primary Colors

| Role | Name | HEX | OKLCH | Usage |
|------|------|-----|-------|-------|
| **Primary** | Electric Blue | `#0066FF` | `oklch(0.546 0.215 264)` | CTAs, links, brand elements |
| **Secondary** | Vibrant Orange | `#FF6B35` | `oklch(0.672 0.195 38)` | Highlights, badges, accents |
| **Accent** | Success Green | `#00D97E` | `oklch(0.765 0.19 163)` | Success states, checkmarks |

### Neutral Colors

| Role | Name | HEX | OKLCH | Usage |
|------|------|-----|-------|-------|
| **Background** | Cloud White | `#F8FAFC` | `oklch(0.98 0.002 250)` | Page background (light) |
| **Background Dark** | Midnight Blue | `#1A1D23` | `oklch(0.2 0.01 260)` | Page background (dark) |
| **Text Primary** | Charcoal | `#1E293B` | `oklch(0.255 0.015 260)` | Headings, body text |
| **Text Secondary** | Slate | `#64748B` | `oklch(0.55 0.025 260)` | Secondary text, labels |
| **Text Muted** | Light Slate | `#94A3B8` | `oklch(0.715 0.02 260)` | Placeholders, disabled |
| **Border** | Silver | `#E2E8F0` | `oklch(0.925 0.005 260)` | Borders, dividers |

### Semantic Colors

| Role | Name | HEX | Usage |
|------|------|-----|-------|
| **Success** | Emerald | `#10B981` | Compliance pass, verified |
| **Warning** | Amber | `#F59E0B` | Attention needed, pending |
| **Error** | Red | `#EF4444` | Errors, violations |

---

## Typography

### Font Stack

| Role | Font | Weight | Fallback | Usage |
|------|------|--------|----------|-------|
| **Logo/Headings** | Outfit | 600-900 | Pretendard, system-ui | h1-h4, wordmark, display |
| **Body/UI** | Manrope | 400-600 | Pretendard, system-ui | Paragraphs, buttons, labels |
| **Code/Data** | Source Code Pro | 400-500 | D2 Coding, monospace | Regulation IDs, legal refs |
| **Korean** | Pretendard | 400-700 | system-ui | All Korean text |

### Type Scale

| Level | Size | Weight | Font | Line Height |
|-------|------|--------|------|-------------|
| h1 | 36px / 2.25rem | 800 | Outfit | 1.2 |
| h2 | 28px / 1.75rem | 700 | Outfit | 1.3 |
| h3 | 22px / 1.375rem | 600 | Outfit | 1.4 |
| h4 | 18px / 1.125rem | 600 | Outfit | 1.4 |
| body | 16px / 1rem | 400 | Manrope | 1.6 |
| small | 14px / 0.875rem | 400 | Manrope | 1.5 |
| caption | 12px / 0.75rem | 500 | Manrope | 1.4 |
| code | 14px / 0.875rem | 400 | Source Code Pro | 1.5 |

---

## Application

### Tailwind CSS Variables

See `src/app/globals.css` for full implementation.

### Next.js Font Loading

Fonts loaded via `next/font/google` in `src/app/layout.tsx`:
- Outfit (display/heading)
- Manrope (body/UI)
- Source Code Pro (mono)
- Pretendard loaded via CDN for Korean support

---

## Brand Assets Needed (TODO)

- [ ] SVG logo (lightbulb + maze symbol)
- [ ] Favicon (16x16, 32x32, 180x180)
- [ ] OG image (1200x630)
- [ ] App icon (512x512)
- [ ] Social media profile image
- [ ] Brand color swatches file
