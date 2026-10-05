# Math Code Center — Architecture & Content Authoring Guide

## 1. Overview

**Math Code Center** is an ultra-lightweight, 100% static academic platform for pure and applied mathematics, formal theorem proving in **Lean 4**, and scientific computing in **Python**, **C**, and **Rust**.

- **Zero Cloud / Zero Bloat**: All features—KaTeX math rendering, Lean 4 syntax highlighting, Global Quick Search (`Ctrl+K`), automatic "On This Page" section outlines, and interactive self-check quizzes—run instantaneously in the browser with no external database or account tracking.
- **Static Hosting Ready**: Directly deployable to **GitHub Pages** (`.github/workflows/deploy.yml`) and **GitLab Pages** (`.gitlab-ci.yml`).

---

## 2. How to Add New Content Easily

You can add content either by running the built-in CLI commands or by dropping `.md` files directly into `content/`. Both TOML (`+++`) and YAML (`---`) frontmatter (or even plain Markdown starting with `# Title`) are supported automatically.

### A. Add a New Blog Article / Essay
Run:
```bash
npm run new:article -- "Galois Theory and Solvability by Radicals"
```
Or create any `.md` file in `content/blog/<slug>.md`:
```markdown
+++
title = 'Galois Theory and Solvability by Radicals'
date = '2026-10-05'
domain = 'Pure Math'
description = 'Field extensions, automorphism groups, and the insolvability of the quintic.'
+++

## 1. Field Extensions & Automorphisms
Write inline LaTeX like $\text{Gal}(E/F)$ or display math:
$$|\text{Gal}(E/F)| = [E : F]$$

## 2. Computational Verification
```lean
-- Lean 4 or Python / C / Rust code block
```
```

### B. Add a New Book & Chapters
Run:
```bash
npm run new:book -- "Measure Theory and Stochastic Calculus"
npm run new:chapter -- measure-theory-and-stochastic-calculus "Sigma Algebras and Lebesgue Integration"
```
Or create a folder `content/books/<book-slug>/` containing:
- `_index.md` (Book title, subtitle, domain, cover, and preface)
- Any number of chapter files (`chapter-1-intro.md`, `chapter-2-main.md`, etc.)

### C. Add a New Course & Lessons
Run:
```bash
npm run new:course -- "Category Theory for Computer Scientists"
npm run new:lesson -- category-theory-for-computer-scientists "Functors, Natural Transformations, and Yoneda Lemma"
```
Or create a folder `content/courses/<course-slug>/` containing:
- `_index.md` (Course overview & syllabus)
- Lesson `.md` files placed either directly inside `content/courses/<course-slug>/<lesson>.md` or grouped inside module folders `content/courses/<course-slug>/<module>/<lesson>.md`.
- Lesson `.md` files can use optional section dividers (`===EXPLANATION===`, `===READING===`, `===CODE===`, `===QUIZ===`), or just plain Markdown for a pure lecture page.

### D. Rebuild Static Site
After adding or editing any `.md` file, run:
```bash
npm run build
```
This compiles all pages, updates the Unified Library (`/library/`), Courses Catalog (`/courses/`), Books Catalog (`/books/`), Blog Index (`/blog/`), and the Global `Ctrl+K` Search Index (`public/search-index.json`).
