# Unified 3-Column Catalog Architecture for Courses, Books & Research Essays

Transform the Courses (`/courses/`), Blog & Research Essays (`/blog/`), and Books (`/books/`) catalogs from stretched full-width rows into a unified, high-density **3-column architectural card grid** (matching `/library/`), complete with automatic **Math & Code visual header art** for courses, **live $\LaTeX$ theorem preview banners** for blog essays, and a clean repository structure with an updated `.gitignore`.

## User Review & Critical Decisions

> [!IMPORTANT]
> All three architectural choices below were confirmed during our design review and will be applied consistently across the static generator, templates, and stylesheet.

- **Confirmed Decision 1 — Courses Catalog (`/courses/`)**: Replace the full-width stacked rows with a **3-column architectural card grid** featuring **Math & Code visual header art** (displaying each course's signature theorem or formal proof snippet, domain badge, difficulty level, lesson links, and direct "Start Course" CTA).
- **Confirmed Decision 2 — Blog & Research Essays (`/blog/` & Home)**: Replace the single-column ledger list with a **3-column card grid** featuring **live $\LaTeX$ formula preview headers** (automatically extracted from each essay's primary display equation or frontmatter formula so new articles never require manual image creation).
- **Confirmed Decision 3 — Workspace Cleanup & `.gitignore`**: Remove unused legacy directories and templates (such as unused instructor data/shortcodes and duplicate archetypes) and update `.gitignore` to exclude `.aistudio/`, build caches, temporary artifacts, and OS/editor files.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates wasted horizontal whitespace on `/courses/`, `/blog/`, and `/books/` by unifying all catalog pages around the same crisp 3-column card grid that powers `/library/`. Every card automatically renders a rich visual header—either a formal proof / code preview for courses, a rendered $\LaTeX$ equation banner for essays, or cover artwork with expandable chapter links for monographs.
- **Target Audience / Persona**: Mathematicians, formal verification researchers, and computer science students browsing courses, books, and research essays on desktop and mobile viewports.
- **Key Value**:
  1. **Zero Wasted Space**: 3-column cards display all three course tracks or three essays side-by-side above the fold instead of requiring long vertical scrolling through wide, half-empty rows.
  2. **Zero-Friction Authoring**: When you add a new course or blog article via `npm run new:course` or `npm run new:article`, the build engine automatically extracts its signature $\LaTeX$ equation or code snippet to generate its visual card header—no manual image design required.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Browsing Courses (`/courses/`)**: Users land on a 3-column grid where each course card presents a dark blueprint visual header with a live theorem/code badge, course title, summary, clickable numbered lesson pills (`01`, `02`), and direct action buttons (**Start Lesson 1** and **Syllabus**).
  2. **Browsing Blog & Research Essays (`/blog/`)**: Users browse a 3-column grid of essay cards. Each card's top banner renders the article's core mathematical identity (`$$...$$`) over a subtle geometric coordinate grid, followed by publication date, reading time, domain tag, title, summary, and **Read Essay** link.
  3. **Browsing Books (`/books/`)**: Upgraded to a balanced 3-column monograph grid pairing each book's cover artwork and metadata with direct chapter jump links (`Ch. 1`, `Ch. 2`, ...) and **Read Chapter 1** / **Overview** actions.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark Academic & Formal Proof Studio (ETH Zürich / Princeton Press / Lean 4 Mathlib aesthetic).
  - *Color Palette & Mood*: Deep obsidian canvas (`#0B0F17`), elevated slate card surfaces (`#111827`), blueprint grid header backdrops (`#090D16` with subtle radial/grid rules), cobalt proof accents (`#3B82F6`), emerald verification badges (`#10B981`), and warm ivory light-mode support (`#F8FAFC`).
  - *Typography & Hierarchy*: `Fraunces` editorial serif for course, book, and essay titles; `Plus Jakarta Sans` for descriptions; `JetBrains Mono` for code badges, lesson indices, and metadata; native `KaTeX` for mathematical formula banners.
  - *Component Styling & Layout*: Responsive 3-column CSS Grid (`repeat(3, minmax(0, 1fr))` on desktop, 2 columns on tablet, 1 column on mobile) with `1.5rem` gap and uniform flex-column card heights so footer CTAs align horizontally across every row.
- **Interactive Feedback & Motion**: Instant client-side search and domain filtering (`All Domains`, `Lean 4 & Proofs`, `Pure Math`, `Applied Math`) with live result counters, empty-state reset buttons, and subtle border elevation on card hover.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Automatic Mathematical & Code Header Art Instead of Static Raster Images**
  - *Chosen Approach*: Generate structured HTML/SVG/KaTeX visual header banners at build time using each course's or essay's actual mathematical formula (`$$...$$`) and language signature (`Lean 4`, `Python`, `C`).
  - *Why*: Looks crisp at any retina resolution, loads instantaneously with zero image bandwidth overhead, and works automatically whenever you add a new course or article without needing to create a `.jpg` file.
  - *Alternatives Considered*: Static `.jpg` thumbnails for every course and blog post, which add repository bloat and leave new user-created posts without artwork.
- **Decision 2: Unified 3-Column Card Grid Across `/library/`, `/courses/`, `/books/`, and `/blog/`**
  - *Chosen Approach*: Standardize all four catalog pages on the 3-column architectural card layout with domain filter bars and live search counters.
  - *Why*: Creates a cohesive visual rhythm across the entire website and eliminates the empty right-hand space caused by single-column rows.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   CONTENT AUTHORING LAYER (Markdown + LaTeX)               │
│     Courses & Lessons              Monographs             Research Essays  │
└─────────────┬──────────────────────────┬─────────────────────────┬─────────┘
              │                          │                         │
              ▼                          ▼                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                 STATIC BUILD & EXTRACTION ENGINE (Node.js)                 │
│  • Parses TOML / YAML / Markdown frontmatter & section dividers            │
│  • Automatically extracts primary $$...$$ display formula or code preview  │
│  • Generates 3-column catalog cards + scoped Course & Book reader views    │
│  • Outputs global Ctrl+K search index & GitHub/GitLab Pages bundle         │
└─────────────┬──────────────────────────┬─────────────────────────┬─────────┘
              │                          │                         │
              ▼                          ▼                         ▼
┌─────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────┐
│   /courses/ Catalog     │ │    /books/ Catalog     │ │   /blog/ Catalog    │
│ • 3-Col Course Grid     │ │ • 3-Col Monograph Grid │ │ • 3-Col Essay Grid  │
│ • Math & Code Art Header│ │ • Cover + Chapter Links│ │ • Live LaTeX Banner │
│ • Numbered Lesson Pills │ │ • Start Ch. 1 CTA      │ │ • Domain Filter Bar │
└─────────────────────────┘ └────────────────────────┘ └─────────────────────┘
```

- **Data Model & State**:
  - **Course Header Extraction**: Each course card extracts a signature mathematical formula (from `formula` frontmatter or the first `$$...$$` block in the course/lessons) plus its primary languages (`Lean 4`, `Python`, `C`) to render the top Math & Code header banner.
  - **Essay Formula Extraction**: Each blog article card extracts its first `$$...$$` display equation (or an optional `formula` frontmatter field) to render inside the card's top $\LaTeX$ preview banner.
- **Interactive Component & State Mapping**:
  - **Catalog Filter Controllers (`/library/`, `/courses/`, `/books/`, `/blog/`)**: Search inputs and domain filter pills dynamically filter the 3-column grid cards, update the `Showing X of Y` status counter, and toggle the empty-state reset view when no items match.
  - **Course & Monograph Reader Sidebars**: Remain strictly scoped to the active course or active monograph so users only see the lessons or chapters of the volume they opened.
