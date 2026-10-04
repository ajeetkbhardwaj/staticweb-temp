# Project Documentation — MathCode (Static Coding-Course Platform)

## 1. Overview

**MathCode** (`https://mathcode.com`) is a statically generated
coding-course website aimed at embedded systems, firmware, and C programming.
It is built with [Hugo](https://gohugo.io/) using a custom theme named
`pyjamacode`. The site works as a course-offering platform: learners browse
courses, open lessons, read/learn in the browser, take per-chapter notes, solve
quiz questions, and (optionally) save code — with optional Firebase-backed
accounts and cloud sync.

- **Title:** Beta.PyjamaCafe
- **Author/Org:** Typobrahe Education LLP
- **Description:** A coding platform for embedded systems software and firmware development.
- **Public Beta:** yes

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Static site generator | Hugo v0.158+ (`hugo.toml`, extended build) |
| Theme | Custom theme in `themes/pyjamacode/` |
| CSS framework | Bootstrap 5 (dark theme via `data-bs-theme="dark"`) |
| Editor | CodeMirror (per-language modes via `langToMode`) |
| Auth & cloud sync | Firebase (`code-pyjamacafe.firebaseapp.com`) — Google/email sign-in, Firestore for notes/code/bookmarks/submissions |
| Content format | Markdown + page bundles |
| JavaScript | Vanilla JS (`themes/pyjamacode/assets/js/main.js`, `auth.js`) |
| Deployment target | Static hosting (GitHub Pages-compatible; all client-side) |

No server-side code is required at build/runtime. All dynamic behavior (auth,
sync, submissions, quizzes, notes) runs in the browser against Firebase.

## 3. Repository Layout

```
/workspaces/staticweb-temp
├── hugo.toml                  # Site config (theme, baseURL, firebase, params)
├── content/
│   ├── dashboard.md           # Dashboard page (layout = "dashboard")
│   └── courses/
│       ├── embedded-101/      # Course topic
│       │   ├── _index.md      # Topic intro page
│       │   ├── c-language/    # Subtopic folder
│       │   │   ├── pointers-and-memory.md   # Lesson (page)
│       │   │   └── ...
│       │   ├── assembly-programming/
│       │   ├── embedded-systems-programming/
│       │   └── mental-models/
│       ├── c-language/        # Second topic
│       │   ├── _index.md
│       │   ├── constants/
│       │   ├── pointers/
│       │   └── ... (one folder per subtopic)
│       └── firmware/
│           ├── _index.md
│           ├── c/             # Lessons
│           └── peripherals/
├── data/instructor/           # Instructor profile (e.g. piyush.yaml)
├── layouts/courses/list.html  # Overrides the course platform view
├── themes/pyjamacode/
│   ├── layouts/               # index.html, _partials, _default, shortcodes
│   └── assets/{css,js}/       # main.css, main.js, auth.js
├── static/                    # Images/logo (pc.png, logo.png, og.png)
└── public/                    # Generated output (hugo)
```

## 4. Course Content Model

Each **course** = a top-level folder under `content/courses/` containing an
`_index.md` (topic intro, its `File.Dir` matches `courses/<topic>/`).
Each **subtopic** = a folder one level deeper (`courses/<topic>/<subtopic>/`).
Each **lesson** = a Markdown page (`courses/<topic>/<subtopic>/<lesson>.md`).

### Lesson front matter (TOML)

```toml
+++
date = '2026-07-05T22:00:00+05:30'
title = 'Blink an LED'
difficulty = 'easy'          # easy | medium | hard
language = 'c'               # c | cpp | python | assembly
topic_weight = 2             # ordering of topics in the sidebar
subtopic_weight = 2          # ordering of subtopics
weight = 1                   # ordering of lessons within a subtopic
initial_code = '''...'''     # starter code for the editor

[[test_cases]]
input = ''
expected = 'LED toggling detected'
+++
```

### Lesson body sections

Lesson bodies are split into labeled sections which the platform renders into
tabs/panes:

- `## Problem Statement` — the challenge shown in the center pane.
- `===EXPLANATION===` — lecture text (the "Lecture" tab).
- `===CODE===` — code listings / starter files (used for the file tabs and as
  the **Practical Lab** fallback in the reading pane when a chapter has no
  reading material).
- `===QUIZ===` — quiz items parsed per question.
- `===READING===` (or `<!--reading-->` markers) — optional reading material
  shown in the right reading pane (or "Reading" tab).

A lesson page is one of two layouts: `reading` (right pane shows reading/lab,
no editor) or `code` (right pane shows the editor workspace with file tabs).

## 5. Main Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Standalone marketing-style landing page: hero, "What We Offer" course cards (auto-listed from `courses/`), Services grid, CTA. |
| `/courses/` | The main learning platform: sidebar with course tree, center lesson pane, right reading/editor pane. |
| `/courses/<topic>/` | Topic intro ("Course Details") shown inside the platform. |
| `/courses/<topic>/<subtopic>/<lesson>/` | A lesson page (reading layout or code layout). |
| `/dashboard/` | Progress dashboard (quiz results, submissions, streaks/time) after sign-in. |

## 6. Feature Inventory

### Learning experience
- Sidebar course tree: topics → subtopics → lessons, search box, Courses/Bookmarks tabs.
- Lesson center pane: Problem Statement, Lecture (explanation), Quiz tab, Reading tab (code layout only).
- Right pane: reading material (code layout: merged reading tab; reading layout: right pane) or editor workspace.
- Editor workspace: CodeMirror editor, file tabs for multi-file lessons, Reset / Reset All, typing indicator, difficulty badge.
- **Practical Lab fallback**: when a chapter has no reading material, the right pane now renders the chapter's code section ("Practical Lab"); if the chapter has neither, the pane is hidden instead of showing dead space.
- Quiz rendering with instant feedback; results persisted locally (`pyjamacode-quiz-results`).
- Bookmarks per lesson.

### Personal notes
- Floating notes window: drag, resize (any edge/corner), minimize widget, maximize/restore.
- Markdown editor + preview, per-chapter notes saved locally; export to Markdown or PDF.

### Accounts & sync (Firebase)
- Sign in via Firebase Auth (navbar Sign in button, avatar menu, Dashboard link, Sign out, Reset profile with confirmation).
- Cloud sync of code, notes, bookmarks, and submissions via Firestore; "Sync to cloud" in the avatar menu/footer, sync indicator dot, sync confirmation modal.
- Guest mode: browse and take notes locally; auth gates sign-in to sync.

### Extras
- Image zoom (click to enlarge), heading anchor links (#), YouTube/Vimeo embeds.
- Dark CRT-green-accented theme (`--crt-green`, scanline landing background previously, JetBrains Mono headings).
- Resizable panes (sidebar and center panes), keyboard shortcut Ctrl/Cmd+S to save code+notes, Escape to exit notes preview.
- Prev/Next problem navigation within the platform.

### Removed features (current state)
- Code judge / "Check" / Run buttons (no backend); `judgeUrl` removed from config.
- Editor show/hide toggle and editor↔console resizer (removed for simpler layout).

## 7. User Flow (enroll via signup)

1. Visitor lands on `/` (landing page) → clicks **Explore Courses** →
   `/courses/` shows the platform with the first course expanded.
2. Visitor browses lessons; gating: running/checking code and syncing notes
   require sign-in; browsing and local notes are free.
3. **Signup/sign-in** via the navbar (Firebase Auth). After sign-in the
   avatar menu links to `/dashboard/`.
4. On the dashboard the learner sees their progress (submissions, quiz
   results, time spent) and can resume.
5. Choosing a course/lesson in the sidebar opens it in the platform; notes,
   code, bookmarks, and quiz results are saved locally and, when signed in,
   synced to Firestore on demand ("Sync to cloud").

> Note: "enrollment" today = signing in and selecting a course. There is no
> paid enrollment/checkout flow.

## 8. Styling & Theming Notes

- All styling is in `themes/pyjamacode/assets/css/main.css` plus Bootstrap.
- Dark-first; body uses `vh-100`, `main` is `flex-grow-1` with `overflow`
  handling per page (landing page scrolls independently).
- Accent palette: Bootstrap primary + CRT phosphor green (`--crt-green`,
  `--crt-green-rgb: 34, 204, 34`); JetBrains Mono for code/editor.
- Course color coding in the sidebar tree per topic.
- Accessibility: respects `prefers-reduced-motion` for animated backgrounds.

## 9. Configuration Highlights (`hugo.toml`)

```toml
baseURL = 'https://code.pyjamacafe.com'
languageCode = 'en-us'
title = 'Beta.PyjamaCafe'
theme = 'pyjamacode'

[params]
  author = 'Typobrahe Education LLP'
  description = '...'
  mobileBreakpoint = 1279
  maxSessions = 1
  allowAuthModalClose = true
  [params.firebase] ...   # Firebase web config (public keys)

[markup]                  # Goldmark + syntax highlight (github style)
disableKinds = ['taxonomy', 'term']
```

## 10. How to Run / Develop

```bash
hugo server --bind 0.0.0.0 --port 1313 --disableFastRender
# open http://localhost:1313/  (or the forwarded port URL)
```

Production build: `hugo` → `public/`.
