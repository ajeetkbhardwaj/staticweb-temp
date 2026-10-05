import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');

const SITE = {
  title: 'Math Code Center',
  baseURL: 'https://mathcode.org',
  description: 'A platform for pure and applied mathematics, formal proofs in Lean 4, and scientific computing.'
};

const LANG_LABELS = {
  lean: 'Lean 4',
  lean4: 'Lean 4',
  python: 'Python',
  py: 'Python',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  rust: 'Rust',
  rs: 'Rust',
  julia: 'Julia',
  bash: 'Shell',
  sh: 'Shell',
  text: 'Code'
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function humanizeSlug(slug) {
  return String(slug || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Configure marked renderer so fenced code blocks get line numbers + language header + Copy button
const renderer = new marked.Renderer();
renderer.code = function({ text, lang }) {
  const rawLang = (lang || 'text').trim().split(/\s+/)[0].toLowerCase();
  const label = LANG_LABELS[rawLang] || rawLang.toUpperCase();
  const cleanCode = String(text || '').replace(/\n$/, '');
  const lines = cleanCode.split('\n');
  const lineSpans = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
  return `<div class="code-block" data-lang="${escapeHtml(rawLang)}">
  <div class="code-block-header">
    <span class="code-lang-label">${escapeHtml(label)}</span>
    <button type="button" class="code-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').textContent).then(()=>{this.textContent='Copied!';setTimeout(()=>{this.textContent='Copy'},1500)})">Copy</button>
  </div>
  <div class="code-block-body">
    <div class="code-line-numbers" aria-hidden="true">${lineSpans}</div>
    <pre><code class="language-${escapeHtml(rawLang)}">${escapeHtml(cleanCode)}</code></pre>
  </div>
</div>`;
};
marked.setOptions({ renderer, gfm: true, breaks: false });

// Render Markdown while preserving $$...$$ and $...$ LaTeX expressions intact for KaTeX
function renderMarkdownWithLatex(md) {
  if (!md || !md.trim()) return '';
  const mathTokens = [];
  const codeTokens = [];

  // 1. Temporarily protect fenced code blocks so $ inside code is not treated as math
  let working = md.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeTokens.length;
    codeTokens.push(match);
    return `@@CODE_BLOCK_TOKEN_${idx}@@`;
  });

  // 2. Temporarily protect inline code `...`
  working = working.replace(/`[^`\n]+`/g, (match) => {
    const idx = codeTokens.length;
    codeTokens.push(match);
    return `@@CODE_BLOCK_TOKEN_${idx}@@`;
  });

  // 3. Protect display math $$...$$
  working = working.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
    const idx = mathTokens.length;
    mathTokens.push(match);
    return `@@MATH_TOKEN_${idx}@@`;
  });

  // 4. Protect inline math $...$
  working = working.replace(/\$([^\$\n]+?)\$/g, (match) => {
    const idx = mathTokens.length;
    mathTokens.push(match);
    return `@@MATH_TOKEN_${idx}@@`;
  });

  // 5. Restore code blocks before running marked
  working = working.replace(/@@CODE_BLOCK_TOKEN_(\d+)@@/g, (_, i) => codeTokens[Number(i)]);

  // 6. Parse Markdown
  let html = marked.parse(working);

  // 7. Restore LaTeX tokens verbatim so KaTeX renders them cleanly
  html = html.replace(/@@MATH_TOKEN_(\d+)@@/g, (_, i) => mathTokens[Number(i)]);
  return html;
}

// Parse TOML (+++ ... +++), YAML (--- ... ---), or Frontmatter-free Markdown
function parseFrontmatterAndBody(raw, fallbackSlug = '') {
  const params = {};
  let body = raw;

  const tomlMatch = raw.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n?([\s\S]*)$/);
  const yamlMatch = !tomlMatch && raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (tomlMatch || yamlMatch) {
    const fm = (tomlMatch || yamlMatch)[1];
    body = (tomlMatch || yamlMatch)[2];
    const separator = tomlMatch ? '=' : ':';
    const lines = fm.split(/\r?\n/);
    for (const line of lines) {
      const idx = line.indexOf(separator);
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) continue;
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (val !== '' && !Number.isNaN(Number(val))) {
        val = Number(val);
      }
      params[key] = val;
    }
  }

  if (!params.title) {
    const h1Match = body.match(/^\s*#\s+(.+?)\s*$/m);
    if (h1Match) {
      params.title = h1Match[1].trim();
      body = body.replace(h1Match[0], '').trim();
    } else if (fallbackSlug) {
      params.title = humanizeSlug(fallbackSlug);
    }
  }

  return { params, body };
}

function estimateReadingTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
}

function extractPlainSummary(md, maxLen = 155) {
  const cleaned = String(md || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$\n]+\$/g, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/===[A-Z]+===/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen).replace(/\s+\S*$/, '') + '...' : cleaned;
}

function formatDate(dateStr) {
  const d = dateStr ? new Date(String(dateStr).slice(0, 10) + 'T12:00:00Z') : new Date('2026-10-04T12:00:00Z');
  if (Number.isNaN(d.getTime())) return 'Oct 4, 2026';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function formatLongDate(dateStr) {
  const d = dateStr ? new Date(String(dateStr).slice(0, 10) + 'T12:00:00Z') : new Date('2026-10-04T12:00:00Z');
  if (Number.isNaN(d.getTime())) return 'October 4, 2026';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// Parse course lesson sections (===EXPLANATION===, ===READING===, ===CODE===, ===QUIZ===)
function parseCourseSections(rawBody) {
  let explanation = rawBody;
  let reading = '';
  let codesPart = '';
  let quiz = '';

  if (explanation.includes('===QUIZ===')) {
    const parts = explanation.split('===QUIZ===');
    explanation = parts[0];
    quiz = parts.slice(1).join('===QUIZ===').trim();
  }
  if (explanation.includes('===CODE===')) {
    const parts = explanation.split('===CODE===');
    explanation = parts[0];
    codesPart = parts.slice(1).join('===CODE===').trim();
  }
  if (explanation.includes('===READING===')) {
    const parts = explanation.split('===READING===');
    explanation = parts[0];
    reading = parts.slice(1).join('===READING===').trim();
  }
  explanation = explanation.replace('===EXPLANATION===', '\n\n').trim();

  // Extract fenced code blocks inside ===CODE===
  const codes = {};
  const codeBlockRegex = /```([a-zA-Z0-9_+-]+)\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = codeBlockRegex.exec(codesPart)) !== null) {
    codes[m[1].trim()] = m[2].replace(/\n$/, '');
  }

  return { explanation, reading, codes, quiz };
}

// Parse ===QUIZ=== markdown into structured quiz questions (supports both ## Heading blocks and --- blocks)
function parseQuizQuestions(quizMarkdown) {
  if (!quizMarkdown || !quizMarkdown.trim()) return [];

  // Normalize blocks: split either by --- or by lines starting with ##
  let blocks = [];
  if (/\n---\n/.test(quizMarkdown)) {
    blocks = quizMarkdown.split(/\n---\n/);
  } else if (/^##\s+/m.test(quizMarkdown)) {
    blocks = quizMarkdown
      .trim()
      .split(/(?=^##\s+)/m)
      .map(b => b.trim())
      .filter(Boolean);
  } else {
    blocks = [quizMarkdown];
  }

  const questions = [];
  const letterMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    let qLines = [];
    let options = [];
    let expLines = [];
    let explicitCorrectIdx = -1;
    let state = 'question';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed && state === 'question' && qLines.length === 0) continue;

      if (trimmed.startsWith('## ')) {
        qLines.push(trimmed.slice(3).trim());
      } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
        state = 'options';
        options.push({ text: trimmed.slice(6), correct: true });
      } else if (trimmed.startsWith('- [ ] ')) {
        state = 'options';
        options.push({ text: trimmed.slice(6), correct: false });
      } else if (/^Correct:\s*([A-Fa-f])\b/.test(trimmed)) {
        const m = trimmed.match(/^Correct:\s*([A-Fa-f])\b/);
        if (m) explicitCorrectIdx = letterMap[m[1].toUpperCase()] ?? -1;
      } else if (trimmed.startsWith('Explanation:')) {
        state = 'explanation';
        const rest = trimmed.slice('Explanation:'.length).trim();
        if (rest) expLines.push(rest);
      } else if (trimmed.startsWith('> ')) {
        state = 'explanation';
        expLines.push(trimmed.slice(2));
      } else if (trimmed === '>') {
        state = 'explanation';
        expLines.push('');
      } else if (state === 'question') {
        qLines.push(line);
      } else if (state === 'explanation') {
        expLines.push(line);
      }
    }

    if (explicitCorrectIdx >= 0 && options[explicitCorrectIdx]) {
      options.forEach((o, i) => { o.correct = (i === explicitCorrectIdx); });
    }

    if (qLines.length > 0 && options.length > 0) {
      questions.push({
        question: renderMarkdownWithLatex(qLines.join('\n')),
        options: options.map(o => ({
          text: renderMarkdownWithLatex(o.text).replace(/^<p>|<\/p>\n?$/g, ''),
          correct: o.correct
        })),
        explanation: expLines.length > 0 ? renderMarkdownWithLatex(expLines.join('\n')) : ''
      });
    }
  }
  return questions;
}

// HTML Shell (Head + Topbar + Global Search Modal + Main + Footer)
function renderPageShell({ title, description, permalink, section, isHome = false, searchIndexJson = '[]', mainHtml }) {
  const fullTitle = isHome
    ? `${SITE.title} — Pure & Applied Mathematics, Lean 4 Proofs & Code`
    : `${title} | ${SITE.title}`;
  const desc = description || SITE.description;
  const canonicalUrl = `${SITE.baseURL}${permalink}`;

  return `<!DOCTYPE html>
<html lang="en-us" data-bs-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta property="og:title" content="${escapeHtml(title || SITE.title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${SITE.baseURL}/og.png">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="${isHome ? 'website' : 'article'}">
  <meta property="og:site_name" content="${SITE.title}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title || SITE.title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${SITE.baseURL}/og.png">
  <link rel="icon" type="image/png" href="/pc.png">
  <script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('mathcode-theme') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
      } catch (e) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      }
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=JetBrains+Mono:ital,wght@0,400..700;1,400..600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
  window.__APP_CONFIG__ = {
    mobileBreakpoint: 1279
  };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
  <link rel="stylesheet" href="/css/main.css">
  <script src="/js/main.js" defer></script>
</head>
<body>
  <script id="global-search-index" type="application/json">${searchIndexJson}</script>
  <header class="topbar">
    <div class="topbar-zone topbar-left">
      <button id="sidebarToggleBtn" class="topbar-icon-btn d-none" type="button" aria-label="Toggle Curriculum Drawer" title="Toggle Sidebar">
        <i class="bi bi-layout-sidebar-inset"></i>
      </button>
      <a href="/" class="brand-link" aria-label="Math Code Center Home">
        <span class="brand-glyph" aria-hidden="true">&sum;</span>
        <span class="brand-text">Math Code Center</span>
      </a>
    </div>

    <nav class="topbar-zone topbar-center" id="primaryNav" aria-label="Primary Navigation">
      <a href="/library/" class="topnav-link${section === 'library' ? ' active' : ''}">Library</a>
      <a href="/courses/" class="topnav-link${section === 'courses' ? ' active' : ''}">Courses</a>
      <a href="/books/" class="topnav-link${section === 'books' ? ' active' : ''}">Books</a>
      <a href="/blog/" class="topnav-link${section === 'blog' ? ' active' : ''}">Blog</a>
    </nav>

    <div class="topbar-zone topbar-right">
      <button id="globalSearchBtn" class="topbar-search-trigger" type="button" aria-label="Quick Search across all courses, books, and articles" title="Quick Search (Ctrl+K or /)">
        <i class="bi bi-search"></i>
        <span class="topbar-search-label">Search...</span>
        <kbd class="topbar-search-kbd">Ctrl K</kbd>
      </button>
      <button id="themeToggleBtn" class="topbar-icon-btn" type="button" aria-label="Toggle dark and light theme" title="Toggle theme (Dark / Light)">
        <i class="bi bi-sun" id="themeToggleIcon"></i>
      </button>
      <button id="mobileNavToggleBtn" class="topbar-icon-btn d-md-none" type="button" aria-label="Toggle Navigation Menu" title="Menu">
        <i class="bi bi-list"></i>
      </button>
    </div>
  </header>

  <nav id="mobileNavDrawer" class="mobile-nav-drawer d-none" aria-label="Mobile Navigation">
    <a href="/library/" class="mobile-nav-link${section === 'library' ? ' active' : ''}"><i class="bi bi-collection"></i> Unified Library</a>
    <a href="/courses/" class="mobile-nav-link${section === 'courses' ? ' active' : ''}"><i class="bi bi-easel2"></i> Interactive Courses</a>
    <a href="/books/" class="mobile-nav-link${section === 'books' ? ' active' : ''}"><i class="bi bi-journal-bookmark"></i> Mathematical Monographs</a>
    <a href="/blog/" class="mobile-nav-link${section === 'blog' ? ' active' : ''}"><i class="bi bi-pen"></i> Research Essays &amp; Blog</a>
  </nav>

  <div id="globalSearchModal" class="search-modal-backdrop d-none" role="dialog" aria-modal="true" aria-label="Global Catalog Search">
    <div class="search-modal-dialog">
      <div class="search-modal-header">
        <i class="bi bi-search search-modal-icon"></i>
        <input type="search" id="globalSearchInput" class="search-modal-input" placeholder="Jump to any course, lesson, book chapter, theorem, or essay..." autocomplete="off">
        <button type="button" id="globalSearchCloseBtn" class="topbar-icon-btn" aria-label="Close search"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="search-modal-filters" role="group" aria-label="Filter search results by type">
        <button type="button" class="filter-seg-btn active" data-search-type="all">All</button>
        <button type="button" class="filter-seg-btn" data-search-type="course">Courses &amp; Lessons</button>
        <button type="button" class="filter-seg-btn" data-search-type="book">Books &amp; Chapters</button>
        <button type="button" class="filter-seg-btn" data-search-type="article">Blog Essays</button>
      </div>
      <div id="globalSearchResults" class="search-modal-results"></div>
      <div class="search-modal-footer">
        <span><kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate</span>
        <span><kbd>Enter</kbd> to open</span>
        <span><kbd>Esc</kbd> to close</span>
      </div>
    </div>
  </div>

  <main style="flex:1;display:flex;flex-direction:column;overflow:hidden">
    ${mainHtml}
  </main>

  <footer class="statusbar">
    <span class="statusbar-left"></span>
    <span class="statusbar-center">&copy; 2026 Math Code Center. Pure &amp; Applied Mathematics &middot; Lean 4 &middot; Scientific Computing.</span>
    <span class="statusbar-right"></span>
  </footer>
</body>
</html>`;
}

function writePage(relPath, html) {
  const fullPath = path.join(PUBLIC_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, 'utf8');
}

// Load all content from content/blog, content/books, content/courses
function loadContent() {
  // 1. Blog articles
  const blogDir = path.join(CONTENT_DIR, 'blog');
  const articles = [];
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') && f !== '_index.md');
    for (const file of blogFiles) {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf8');
      const { params, body } = parseFrontmatterAndBody(raw, slug);
      articles.push({
        slug,
        title: params.title || humanizeSlug(slug),
        date: params.date || '2026-10-04',
        domain: params.domain || 'Mathematics & Code',
        description: params.description || '',
        body,
        html: renderMarkdownWithLatex(body),
        readingTime: estimateReadingTime(body),
        permalink: `/blog/${slug}/`
      });
    }
  }
  articles.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  // 2. Books & Chapters
  const booksDir = path.join(CONTENT_DIR, 'books');
  const books = [];
  if (fs.existsSync(booksDir)) {
    const bookEntries = fs.readdirSync(booksDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of bookEntries) {
      const bookSlug = dir.name;
      const bookFolder = path.join(booksDir, bookSlug);
      const indexFile = path.join(bookFolder, '_index.md');
      let params = {};
      let body = '';
      if (fs.existsSync(indexFile)) {
        const parsed = parseFrontmatterAndBody(fs.readFileSync(indexFile, 'utf8'), bookSlug);
        params = parsed.params;
        body = parsed.body;
      }

      const chapterFiles = fs.readdirSync(bookFolder).filter(f => f.endsWith('.md') && f !== '_index.md');
      const chapters = [];
      for (const chFile of chapterFiles) {
        const chSlug = chFile.replace(/\.md$/, '');
        const chRaw = fs.readFileSync(path.join(bookFolder, chFile), 'utf8');
        const { params: chParams, body: chBody } = parseFrontmatterAndBody(chRaw, chSlug);
        const inferredNum = Number((chSlug.match(/(\d+)/) || [])[1]) || 99;
        chapters.push({
          slug: chSlug,
          bookSlug,
          bookTitle: params.title || humanizeSlug(bookSlug),
          bookPermalink: `/books/${bookSlug}/`,
          bookDomain: params.domain || 'Pure Math',
          title: chParams.title || humanizeSlug(chSlug),
          chapter: chParams.chapter || chParams.weight || (inferredNum !== 99 ? inferredNum : chapters.length + 1),
          weight: chParams.weight || chParams.chapter || inferredNum,
          description: chParams.description || '',
          body: chBody,
          html: renderMarkdownWithLatex(chBody),
          readingTime: estimateReadingTime(chBody),
          permalink: `/books/${bookSlug}/${chSlug}/`
        });
      }
      chapters.sort((a, b) => (a.weight - b.weight) || a.slug.localeCompare(b.slug));

      books.push({
        slug: bookSlug,
        title: params.title || humanizeSlug(bookSlug),
        subtitle: params.subtitle || '',
        author: params.author || 'Math Code Center Press',
        domain: params.domain || 'Pure Math',
        level: params.level || 'Advanced Undergraduate',
        weight: params.weight || 10,
        cover: params.cover || '/images/book_lean4_proofs.jpg',
        description: params.description || '',
        body,
        html: renderMarkdownWithLatex(body),
        chapters,
        permalink: `/books/${bookSlug}/`
      });
    }
  }
  books.sort((a, b) => a.weight - b.weight);

  // 3. Courses & Lessons (supports direct files OR nested module folders)
  const coursesDir = path.join(CONTENT_DIR, 'courses');
  const courses = [];
  const allLessons = [];

  if (fs.existsSync(coursesDir)) {
    const courseEntries = fs.readdirSync(coursesDir, { withFileTypes: true }).filter(d => d.isDirectory());

    for (const cDir of courseEntries) {
      const courseSlug = cDir.name;
      const courseFolder = path.join(coursesDir, courseSlug);
      const indexFile = path.join(courseFolder, '_index.md');
      let params = {};
      let body = '';
      if (fs.existsSync(indexFile)) {
        const parsed = parseFrontmatterAndBody(fs.readFileSync(indexFile, 'utf8'), courseSlug);
        params = parsed.params;
        body = parsed.body.replace(/^\s*===[A-Z]+===\s*$/gm, '\n\n').trim();
      }

      const courseLessons = [];
      const entries = fs.readdirSync(courseFolder, { withFileTypes: true });

      // A) Direct .md lessons inside content/courses/<course>/<lesson>.md
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
          const lSlug = entry.name.replace(/\.md$/, '');
          const lRaw = fs.readFileSync(path.join(courseFolder, entry.name), 'utf8');
          const { params: lParams, body: lBody } = parseFrontmatterAndBody(lRaw, lSlug);
          const sections = parseCourseSections(lBody);
          const quizQuestions = parseQuizQuestions(sections.quiz);

          courseLessons.push({
            id: lSlug,
            slug: lSlug,
            title: lParams.title || humanizeSlug(lSlug),
            description: lParams.description || extractPlainSummary(sections.explanation),
            difficulty: lParams.difficulty || 'medium',
            language: lParams.language || 'lean',
            topic: courseSlug,
            topic_title: params.title || humanizeSlug(courseSlug),
            topic_domain: params.domain || 'Mathematics & Code',
            subtopic: lParams.module || 'core',
            topic_weight: lParams.topic_weight || params.weight || 10,
            subtopic_weight: lParams.subtopic_weight || 1,
            weight: lParams.weight || 10,
            readingTime: estimateReadingTime(lBody),
            explanationHtml: renderMarkdownWithLatex(sections.explanation),
            readingHtml: renderMarkdownWithLatex(sections.reading),
            codes: sections.codes,
            quizMarkdown: sections.quiz,
            quizQuestions,
            relativeOutPath: `courses/${courseSlug}/${lSlug}/index.html`,
            permalink: `/courses/${courseSlug}/${lSlug}/`
          });
        }
      }

      // B) Module subfolder lessons inside content/courses/<course>/<module>/<lesson>.md
      for (const sub of entries.filter(d => d.isDirectory())) {
        const subSlug = sub.name;
        const subFolder = path.join(courseFolder, subSlug);
        const lessonFiles = fs.readdirSync(subFolder).filter(f => f.endsWith('.md') && f !== '_index.md');

        for (const lFile of lessonFiles) {
          const lSlug = lFile.replace(/\.md$/, '');
          const lRaw = fs.readFileSync(path.join(subFolder, lFile), 'utf8');
          const { params: lParams, body: lBody } = parseFrontmatterAndBody(lRaw, lSlug);
          const sections = parseCourseSections(lBody);
          const quizQuestions = parseQuizQuestions(sections.quiz);

          courseLessons.push({
            id: lSlug,
            slug: lSlug,
            title: lParams.title || humanizeSlug(lSlug),
            description: lParams.description || extractPlainSummary(sections.explanation),
            difficulty: lParams.difficulty || 'medium',
            language: lParams.language || 'lean',
            topic: courseSlug,
            topic_title: params.title || humanizeSlug(courseSlug),
            topic_domain: params.domain || 'Mathematics & Code',
            subtopic: subSlug,
            topic_weight: lParams.topic_weight || params.weight || 10,
            subtopic_weight: lParams.subtopic_weight || 10,
            weight: lParams.weight || 10,
            readingTime: estimateReadingTime(lBody),
            explanationHtml: renderMarkdownWithLatex(sections.explanation),
            readingHtml: renderMarkdownWithLatex(sections.reading),
            codes: sections.codes,
            quizMarkdown: sections.quiz,
            quizQuestions,
            relativeOutPath: `courses/${courseSlug}/${subSlug}/${lSlug}/index.html`,
            permalink: `/courses/${courseSlug}/${subSlug}/${lSlug}/`
          });
        }
      }

      courseLessons.sort((a, b) => (a.subtopic_weight - b.subtopic_weight) || (a.weight - b.weight));
      allLessons.push(...courseLessons);

      courses.push({
        slug: courseSlug,
        title: params.title || humanizeSlug(courseSlug),
        domain: params.domain || 'Mathematics & Code',
        level: params.level || 'Undergraduate',
        weight: params.topic_weight || params.weight || 10,
        description: params.description || '',
        body,
        html: renderMarkdownWithLatex(body),
        lessons: courseLessons,
        permalink: `/courses/${courseSlug}/`
      });
    }
  }

  courses.sort((a, b) => a.weight - b.weight);
  allLessons.sort((a, b) => (a.topic_weight - b.topic_weight) || (a.subtopic_weight - b.subtopic_weight) || (a.weight - b.weight));

  return { articles, books, courses, lessons: allLessons };
}

function buildGlobalSearchIndex({ articles, books, courses, lessons }) {
  const index = [];

  for (const c of courses) {
    index.push({
      category: 'course',
      typeLabel: 'COURSE',
      title: c.title,
      subtitle: `${c.lessons.length} lessons · ${c.level}`,
      domain: c.domain,
      url: c.permalink
    });
  }

  for (const l of lessons) {
    index.push({
      category: 'course',
      typeLabel: 'LESSON',
      title: l.title,
      subtitle: `${l.topic_title} (${humanizeSlug(l.subtopic)})`,
      domain: l.topic_domain || LANG_LABELS[l.language] || l.language.toUpperCase(),
      url: l.permalink
    });
  }

  for (const b of books) {
    index.push({
      category: 'book',
      typeLabel: 'BOOK',
      title: b.title,
      subtitle: `${b.chapters.length} chapters · ${b.level}`,
      domain: b.domain,
      url: b.permalink
    });
    for (const ch of b.chapters) {
      index.push({
        category: 'book',
        typeLabel: `CH. ${ch.chapter}`,
        title: ch.title,
        subtitle: b.title,
        domain: b.domain,
        url: ch.permalink
      });
    }
  }

  for (const a of articles) {
    index.push({
      category: 'article',
      typeLabel: 'ESSAY',
      title: a.title,
      subtitle: `${a.readingTime} min read · ${formatDate(a.date)}`,
      domain: a.domain,
      url: a.permalink
    });
  }

  return index;
}

function renderCodeSolutionsHtml(codes) {
  const langs = Object.keys(codes || {});
  if (langs.length === 0) return '';

  const buttons = langs.map((lang, idx) => {
    const label = LANG_LABELS[lang.toLowerCase()] || lang.toUpperCase();
    return `<button type="button" class="code-lang-btn${idx === 0 ? ' active' : ''}" data-lang="${escapeHtml(lang)}">${escapeHtml(label)}</button>`;
  }).join('');

  const panels = langs.map((lang, idx) => {
    const code = codes[lang];
    const rawLang = lang.toLowerCase();
    const label = LANG_LABELS[rawLang] || lang.toUpperCase();
    const lines = code.split('\n');
    const lineSpans = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
    return `<div class="code-lang-content${idx === 0 ? '' : ' d-none'}" data-lang="${escapeHtml(lang)}">
      <div class="code-block" data-lang="${escapeHtml(rawLang)}">
        <div class="code-block-header">
          <span class="code-lang-label">${escapeHtml(label)}</span>
          <button type="button" class="code-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').textContent).then(()=>{this.textContent='Copied!';setTimeout(()=>{this.textContent='Copy'},1500)})">Copy</button>
        </div>
        <div class="code-block-body">
          <div class="code-line-numbers" aria-hidden="true">${lineSpans}</div>
          <pre><code class="language-${escapeHtml(rawLang)}">${escapeHtml(code)}</code></pre>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="code-solutions mt-4">
    <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
      <h3 class="mb-0" style="font-size:1.1rem"><i class="bi bi-code-slash me-1"></i> Reference Implementations &amp; Formal Proofs</h3>
      <div class="code-lang-switcher d-flex gap-1">${buttons}</div>
    </div>
    ${panels}
  </div>`;
}

function renderQuizHtml(quizQuestions) {
  if (!quizQuestions || quizQuestions.length === 0) return '';
  return `<div id="quizRendered">
    ${quizQuestions.map((q, qi) => `
      <div class="quiz-card" data-question="${qi}">
        <div class="quiz-question-header">
          <span class="quiz-q-number">Question ${qi + 1} of ${quizQuestions.length}</span>
        </div>
        <div class="quiz-question-body markdown-body">${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, oi) => `
            <label class="quiz-option" data-option="${oi}" data-correct="${opt.correct ? 'true' : 'false'}">
              <input type="radio" name="quiz-q-${qi}" value="${oi}">
              <span class="quiz-option-text">${opt.text}</span>
            </label>
          `).join('')}
        </div>
        ${q.explanation ? `
        <div class="quiz-explanation d-none markdown-body">
          <div class="quiz-exp-title"><i class="bi bi-check2-circle"></i> Proof &amp; Explanation</div>
          ${q.explanation}
        </div>` : ''}
      </div>
    `).join('')}
  </div>`;
}

function renderCoursePlatformHtml({ activeId, title, description, language, difficulty, readingTime, activeCourse, isCourseIntro = false, explanationHtml, readingHtml, codes, quizQuestions, prevItem, nextItem }) {
  const codeBlocksHtml = renderCodeSolutionsHtml(codes);
  const quizHtml = renderQuizHtml(quizQuestions);
  const hasReadingOrCode = Boolean((readingHtml && readingHtml.trim()) || codeBlocksHtml);
  const hasQuiz = Boolean(quizQuestions && quizQuestions.length > 0);

  const bySubtopic = {};
  let globalLessonCounter = 0;
  for (const l of activeCourse.lessons) {
    const sub = l.subtopic || 'core';
    if (!bySubtopic[sub]) bySubtopic[sub] = [];
    globalLessonCounter += 1;
    bySubtopic[sub].push({ ...l, lessonNum: globalLessonCounter });
  }

  const modulesHtml = Object.keys(bySubtopic).map(subKey => {
    const subLessons = bySubtopic[subKey];
    const showSubHeader = Object.keys(bySubtopic).length > 1 || subKey !== 'core';
    return `
      <div class="sidebar-module-group" data-module-group="${escapeHtml(subKey)}">
        ${showSubHeader ? `<div class="sidebar-module-label">${escapeHtml(humanizeSlug(subKey))}</div>` : ''}
        ${subLessons.map(l => `
          <a href="${l.permalink}" class="book-toc-item sidebar-lesson-link${activeId === l.id ? ' active' : ''}" data-lesson-id="${escapeHtml(l.id)}" data-search="${escapeHtml((l.title + ' ' + l.subtopic + ' ' + l.language).toLowerCase())}">
            <span class="toc-item-num">Lesson ${String(l.lessonNum).padStart(2, '0')} &middot; ${escapeHtml((LANG_LABELS[l.language] || l.language).toUpperCase())}</span>
            <span class="toc-item-text">${escapeHtml(l.title)}</span>
          </a>
        `).join('')}
      </div>
    `;
  }).join('');

  const paginationHtml = `
    <nav class="chapter-pagination" aria-label="Lesson Navigation">
      ${prevItem ? `
      <a href="${prevItem.permalink}" class="chapter-nav-card prev">
        <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> ${escapeHtml(prevItem.label)}</span>
        <span class="chapter-nav-title">${escapeHtml(prevItem.title)}</span>
      </a>` : `
      <a href="/courses/" class="chapter-nav-card prev">
        <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> All Courses</span>
        <span class="chapter-nav-title">Interactive Courses Catalog</span>
      </a>`}

      ${nextItem ? `
      <a href="${nextItem.permalink}" class="chapter-nav-card next">
        <span class="chapter-nav-label">${escapeHtml(nextItem.label)} <i class="bi bi-arrow-right"></i></span>
        <span class="chapter-nav-title">${escapeHtml(nextItem.title)}</span>
      </a>` : `
      <a href="/courses/" class="chapter-nav-card next">
        <span class="chapter-nav-label">Completed Course <i class="bi bi-check2-circle"></i></span>
        <span class="chapter-nav-title">Browse More Interactive Courses</span>
      </a>`}
    </nav>
  `;

  return `
<div class="platform-layout" id="platformLayout">
  <aside class="platform-pane sidebar-pane" id="sidebarPane">
    <div class="book-sidebar-header">
      <a href="/courses/" class="book-sidebar-back"><i class="bi bi-arrow-left"></i> All Courses</a>
      <h2 class="book-sidebar-title"><a href="${activeCourse.permalink}">${escapeHtml(activeCourse.title)}</a></h2>
      <div class="card-meta-line">${escapeHtml(activeCourse.domain)} &middot; ${activeCourse.lessons.length} Lessons</div>
    </div>
    <div class="p-2 border-bottom">
      <input type="search" id="questionSearch" class="form-control form-control-sm" placeholder="Filter lessons in this course..." autocomplete="off">
    </div>
    <nav class="book-sidebar-toc overflow-auto" id="questionList" aria-label="Course Curriculum">
      <a href="${activeCourse.permalink}" class="book-toc-item${isCourseIntro ? ' active' : ''}">
        <span class="toc-item-num">00 &middot; Syllabus</span>
        <span class="toc-item-text">Course Overview &amp; Syllabus</span>
      </a>
      ${modulesHtml}
    </nav>
  </aside>

  <section class="platform-pane question-pane" id="questionPane">
    <div class="pane-header border-bottom d-flex align-items-center justify-content-between px-3">
      <div class="d-flex align-items-center gap-2 overflow-hidden">
        <button id="sidebarCollapseBtn" class="topbar-icon-btn" type="button" title="Toggle Course Sidebar" aria-label="Toggle Course Sidebar">
          <i class="bi bi-layout-sidebar"></i>
        </button>
        <nav class="studio-breadcrumb mb-0 text-truncate" aria-label="Course Breadcrumb">
          <a href="/library/">Library</a>
          <span>/</span>
          <a href="/courses/">Courses</a>
          ${!isCourseIntro ? `<span>/</span><a href="${activeCourse.permalink}">${escapeHtml(activeCourse.title)}</a>` : ''}
          <span>/</span>
          <span class="current">${escapeHtml(title)}</span>
        </nav>
      </div>
    </div>

    ${!isCourseIntro ? `
    <div class="center-tabs" id="centerTabs">
      <button type="button" class="center-tab active" id="tabAll" data-tab-target="all">
        <i class="bi bi-layers me-1"></i> Full Lesson
      </button>
      <button type="button" class="center-tab" id="tabArticle" data-tab-target="lecture">
        <i class="bi bi-journal-richtext me-1"></i> Lecture &amp; Proofs
      </button>
      ${hasReadingOrCode ? `
      <button type="button" class="center-tab" id="tabReading" data-tab-target="reading">
        <i class="bi bi-file-earmark-code me-1"></i> Reading &amp; Code
      </button>` : ''}
      ${hasQuiz ? `
      <button type="button" class="center-tab" id="tabQuiz" data-tab-target="quiz">
        <i class="bi bi-patch-question me-1"></i> Quiz (${quizQuestions.length})
      </button>` : ''}
    </div>` : ''}

    <div class="question-pane-body overflow-auto" id="questionPaneBody">
      <div class="course-reader-prose">
        <header class="chapter-header">
          <div class="card-meta-line">
            <span class="meta-type-course">${isCourseIntro ? 'COURSE SYLLABUS' : 'INTERACTIVE LESSON'}</span>
            ${language ? `<span class="meta-dot">&middot;</span><span>${escapeHtml((LANG_LABELS[language] || language).toUpperCase())}</span>` : ''}
            ${difficulty ? `<span class="meta-dot">&middot;</span><span>${escapeHtml(difficulty.toUpperCase())}</span>` : ''}
            ${readingTime ? `<span class="meta-dot">&middot;</span><span>${readingTime} MIN READ</span>` : ''}
          </div>
          <h1 class="chapter-title">${escapeHtml(title)}</h1>
          ${description ? `<p class="chapter-lead">${escapeHtml(description)}</p>` : ''}
        </header>

        <div id="autoPageToc" class="page-toc-box d-none"></div>

        <div id="lectureTabPane" class="lesson-section-pane academic-prose markdown-body">
          ${explanationHtml}
        </div>

        ${hasReadingOrCode ? `
        <div id="readingTabPane" class="lesson-section-pane academic-prose markdown-body mt-4 pt-3 border-top">
          ${readingHtml}
          ${codeBlocksHtml}
        </div>` : ''}

        ${hasQuiz ? `
        <div id="quizTabPane" class="lesson-section-pane mt-5 pt-4 border-top">
          <h2 id="concept-and-proof-quiz"><i class="bi bi-patch-question me-2"></i>Concept &amp; Proof Check</h2>
          <p class="text-secondary mb-3" style="font-size:0.92rem">Select an answer to verify your understanding and reveal the mathematical proof explanation.</p>
          <div id="quizContainer" class="quiz-container">
            ${quizHtml}
          </div>
        </div>` : ''}

        ${paginationHtml}
      </div>
    </div>
  </section>
</div>`;
}

function buildAll() {
  // 1. Sync CSS & JS assets into public/
  const cssContent = fs.readFileSync(path.join(ROOT, 'themes/mathcode/assets/css/main.css'), 'utf8');
  fs.mkdirSync(path.join(PUBLIC_DIR, 'css'), { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'css/main.css'), cssContent, 'utf8');

  const jsContent = fs.readFileSync(path.join(ROOT, 'themes/mathcode/assets/js/main.js'), 'utf8');
  fs.mkdirSync(path.join(PUBLIC_DIR, 'js'), { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'js/main.js'), jsContent, 'utf8');

  // Ensure .nojekyll exists in public/ for clean GitHub Pages asset serving
  fs.writeFileSync(path.join(PUBLIC_DIR, '.nojekyll'), '', 'utf8');

  // Remove legacy auth.js, dashboard, and old course/blog directories from public/
  for (const oldPath of [
    'dashboard',
    'js/auth.js',
    'js/main.js.map',
    'js/main.b55c9ca623e92048f9d1676aa221d13d43761c318aad1de46d8b48e5006c3772.js',
    'css/main.css.map',
    'css/main.3e39ab61fa328bc500829d39847b9d2257c8dbb701bf87c060fa54c4844ff814.css',
    'courses/c-language',
    'courses/embedded-101',
    'courses/firmware',
    'blog/what-is-embedded-system'
  ]) {
    const fullOld = path.join(PUBLIC_DIR, oldPath);
    if (fs.existsSync(fullOld)) {
      fs.rmSync(fullOld, { recursive: true, force: true });
    }
  }

  const { articles, books, courses, lessons } = loadContent();
  const searchIndex = buildGlobalSearchIndex({ articles, books, courses, lessons });
  const searchIndexJson = JSON.stringify(searchIndex);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), searchIndexJson, 'utf8');

  // 2. Build Home Page (/public/index.html)
  const homeMain = `
<div class="studio-scroll-page">
  <div class="studio-container">
    <section class="studio-hero">
      <div class="studio-hero-copy">
        <div class="studio-eyebrow">PURE &amp; APPLIED MATHEMATICS &middot; FORMAL PROOFS &middot; SCIENTIFIC COMPUTING</div>
        <h1 class="studio-display-title">Where Formal Mathematical Proof Meets Executable Code.</h1>
        <p class="studio-lead">
          Math Code Center is an open academic studio uniting rigorous mathematical exposition in LaTeX, constructive theorem proving in <strong>Lean 4</strong>, and scientific computation in <strong>Python</strong>, <strong>C</strong>, and <strong>Rust</strong>.
        </p>
        <div class="studio-cta-row">
          <a href="/library/" class="btn-studio-primary">
            <i class="bi bi-collection"></i> Explore Unified Library
          </a>
          <a href="/courses/" class="btn-studio-secondary">
            <i class="bi bi-terminal"></i> Interactive Courses
          </a>
          <a href="/books/" class="btn-studio-secondary">
            <i class="bi bi-book"></i> Read Monographs
          </a>
        </div>
        <div class="studio-meta-line">
          <span>${courses.length} Interactive Courses</span>
          <span class="meta-dot">&middot;</span>
          <span>${books.length} Mathematical Monographs</span>
          <span class="meta-dot">&middot;</span>
          <span>${articles.length} Research Essays</span>
          <span class="meta-dot">&middot;</span>
          <span>Native LaTeX &amp; Lean 4</span>
        </div>
      </div>

      <div class="studio-hero-showcase">
        <div class="hero-visual-frame">
          <img src="/images/hero_math_code_studio.jpg" alt="Geometric manifolds, commutative diagrams, and formal proof trees" class="hero-visual-img">
          <div class="hero-proof-overlay">
            <div class="hero-proof-header">
              <span class="proof-status-indicator"><i class="bi bi-check2-circle"></i> Verified Formalization</span>
              <span class="proof-lang-meta">Lean 4 &middot; Mathlib</span>
            </div>
            <div class="hero-proof-formula">
              $$\\forall f : \\alpha \\to \\beta,\\; \\text{Injective}(f) \\iff \\forall x_1\\, x_2,\\; f(x_1) = f(x_2) \\implies x_1 = x_2$$
            </div>
            <pre class="hero-proof-code"><code class="language-lean">theorem comp_injective {f : α → β} {g : β → γ}
    (hf : Injective f) (hg : Injective g) :
    Injective (g ∘ f) :=
  fun _ _ h => hf (hg h)</code></pre>
          </div>
        </div>
      </div>
    </section>

    <section class="studio-section">
      <div class="section-header-row">
        <div>
          <div class="section-kicker">ARCHITECTURE OF THOUGHT</div>
          <h2 class="section-title">Four Integrated Pillars of Study</h2>
        </div>
        <a href="/library/" class="section-link">Search full catalog <i class="bi bi-arrow-right"></i></a>
      </div>

      <div class="pillars-grid">
        <a href="/library/" class="pillar-card">
          <div class="pillar-top">
            <span class="pillar-index">01</span>
            <i class="bi bi-collection pillar-icon"></i>
          </div>
          <h3 class="pillar-title">Unified Library</h3>
          <p class="pillar-desc">Search and filter every course, multi-chapter book, Lean 4 formalization, and mathematical article from a single index.</p>
          <div class="pillar-meta">ALL RESOURCES &middot; INSTANT FILTER</div>
        </a>

        <a href="/courses/" class="pillar-card">
          <div class="pillar-top">
            <span class="pillar-index">02</span>
            <i class="bi bi-easel2 pillar-icon"></i>
          </div>
          <h3 class="pillar-title">Interactive Courses</h3>
          <p class="pillar-desc">Structured lectures, curated readings, multi-language code implementations, and interactive quizzes with step-by-step proof solutions.</p>
          <div class="pillar-meta">${courses.length} TRACKS &middot; ${lessons.length} LESSONS</div>
        </a>

        <a href="/books/" class="pillar-card">
          <div class="pillar-top">
            <span class="pillar-index">03</span>
            <i class="bi bi-journal-bookmark pillar-icon"></i>
          </div>
          <h3 class="pillar-title">Mathematical Monographs</h3>
          <p class="pillar-desc">Self-contained multi-chapter books on Dependent Type Theory, Spectral Linear Algebra, and Functional Analysis.</p>
          <div class="pillar-meta">${books.length} MONOGRAPHS &middot; CHAPTER READER</div>
        </a>

        <a href="/blog/" class="pillar-card">
          <div class="pillar-top">
            <span class="pillar-index">04</span>
            <i class="bi bi-pen pillar-icon"></i>
          </div>
          <h3 class="pillar-title">Research Essays &amp; Blog</h3>
          <p class="pillar-desc">Deep technical expositions on Curry–Howard correspondence, spectral graph theory, automatic differentiation, and PDEs.</p>
          <div class="pillar-meta">${articles.length} ESSAYS &middot; LONG-FORM LATEX</div>
        </a>
      </div>
    </section>

    <section class="studio-section">
      <div class="section-header-row">
        <div>
          <div class="section-kicker">INTERACTIVE CURRICULUM</div>
          <h2 class="section-title">Core Mathematics &amp; Code Courses</h2>
        </div>
        <a href="/courses/" class="section-link">Browse All Courses <i class="bi bi-arrow-right"></i></a>
      </div>

      <div class="catalog-grid-3">
        ${courses.map(c => `
        <article class="studio-card">
          <div class="card-meta-line">
            <span class="meta-type-course">COURSE</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(c.domain)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(c.level)}</span>
          </div>
          <h3 class="card-title"><a href="${c.permalink}">${escapeHtml(c.title)}</a></h3>
          <p class="card-excerpt">${escapeHtml(c.description)}</p>
          <div class="card-chapter-links">
            ${c.lessons.map(l => `<a href="${l.permalink}" class="chapter-mini-link"><i class="bi bi-terminal"></i> ${escapeHtml(l.title)}</a>`).join('')}
          </div>
          <div class="card-footer-row">
            <a href="${c.permalink}" class="card-action-link">Enter Course Studio <i class="bi bi-arrow-up-right"></i></a>
          </div>
        </article>`).join('')}
      </div>
    </section>

    <section class="studio-section">
      <div class="section-header-row">
        <div>
          <div class="section-kicker">MONOGRAPHS &amp; TEXTBOOKS</div>
          <h2 class="section-title">Featured Books &amp; Chapter Volumes</h2>
        </div>
        <a href="/books/" class="section-link">Browse All Books <i class="bi bi-arrow-right"></i></a>
      </div>

      <div class="catalog-grid-3">
        ${books.map(b => `
        <article class="studio-book-card">
          <a href="${b.permalink}" class="book-cover-link">
            <img src="${b.cover}" alt="${escapeHtml(b.title)}" class="book-cover-img">
          </a>
          <div class="book-card-body">
            <div class="card-meta-line">
              <span class="meta-type-book">BOOK</span>
              <span class="meta-dot">&middot;</span>
              <span>${escapeHtml(b.domain)}</span>
              <span class="meta-dot">&middot;</span>
              <span>${b.chapters.length} Chapters</span>
            </div>
            <h3 class="card-title"><a href="${b.permalink}">${escapeHtml(b.title)}</a></h3>
            <p class="card-excerpt">${escapeHtml(b.description)}</p>
            <div class="card-footer-row">
              <a href="${b.permalink}" class="card-action-link">Read Monograph <i class="bi bi-arrow-right"></i></a>
            </div>
          </div>
        </article>`).join('')}
      </div>
    </section>

    <section class="studio-section studio-section-last">
      <div class="section-header-row">
        <div>
          <div class="section-kicker">EXPOSITORY RESEARCH</div>
          <h2 class="section-title">Recent Articles &amp; Mathematical Notes</h2>
        </div>
        <a href="/blog/" class="section-link">View All Articles <i class="bi bi-arrow-right"></i></a>
      </div>

      <div class="articles-ledger">
        ${articles.slice(0, 4).map(a => `
        <article class="ledger-row">
          <div class="ledger-meta">
            <time datetime="${escapeHtml(a.date)}">${formatDate(a.date)}</time>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(a.domain)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${a.readingTime} min read</span>
          </div>
          <h3 class="ledger-title"><a href="${a.permalink}">${escapeHtml(a.title)}</a></h3>
          <p class="ledger-desc">${escapeHtml(a.description)}</p>
          <a href="${a.permalink}" class="ledger-read-link">Read Essay <i class="bi bi-arrow-right"></i></a>
        </article>`).join('')}
      </div>
    </section>
  </div>
</div>`;

  writePage('index.html', renderPageShell({
    title: SITE.title,
    description: SITE.description,
    permalink: '/',
    section: 'home',
    isHome: true,
    searchIndexJson,
    mainHtml: homeMain
  }));

  // 3. Build Unified Library (/public/library/index.html)
  const totalResources = courses.length + lessons.length + books.length + articles.length;
  const libraryMain = `
<div class="studio-scroll-page">
  <div class="studio-container">
    <header class="page-studio-header">
      <div class="studio-eyebrow">UNIFIED INDEX &middot; COURSES, MONOGRAPHS, LESSONS &amp; ARTICLES</div>
      <h1 class="page-studio-title">Math Code Center Library</h1>
      <p class="page-studio-subtitle">
        Browse, search, and filter all ${totalResources} learning resources across Pure Mathematics, Applied Scientific Computing, and Formal Proofs in Lean 4.
      </p>

      <div class="library-controls-bar" id="libraryControls">
        <div class="library-search-wrap">
          <i class="bi bi-search library-search-icon"></i>
          <input type="search" id="librarySearchInput" class="library-search-input" placeholder="Search by theorem, topic, language (Lean 4, Python, C, Spectral, Galois)..." autocomplete="off">
        </div>

        <div class="library-filter-groups">
          <div class="filter-segment-group" role="group" aria-label="Filter by content type">
            <button type="button" class="filter-seg-btn active" data-filter-type="all">All (${totalResources})</button>
            <button type="button" class="filter-seg-btn" data-filter-type="course">Courses (${courses.length})</button>
            <button type="button" class="filter-seg-btn" data-filter-type="lesson">Lessons (${lessons.length})</button>
            <button type="button" class="filter-seg-btn" data-filter-type="book">Books (${books.length})</button>
            <button type="button" class="filter-seg-btn" data-filter-type="article">Articles (${articles.length})</button>
          </div>

          <div class="filter-segment-group" role="group" aria-label="Filter by mathematical domain">
            <button type="button" class="filter-seg-btn active" data-filter-domain="all">All Domains</button>
            <button type="button" class="filter-seg-btn" data-filter-domain="Formal Proofs & Lean 4">Lean 4 &amp; Proofs</button>
            <button type="button" class="filter-seg-btn" data-filter-domain="Pure Math">Pure Math</button>
            <button type="button" class="filter-seg-btn" data-filter-domain="Applied Math">Applied Math</button>
          </div>
        </div>
      </div>

      <div class="library-status-bar">
        <span id="libraryResultCount">Showing all ${totalResources} resources</span>
        <button type="button" id="libraryResetBtn" class="library-reset-link d-none">Reset filters</button>
      </div>
    </header>

    <div class="catalog-grid-3" id="libraryCatalogGrid">
      ${courses.map(c => `
      <article class="studio-card library-item-card" data-type="course" data-domain="${escapeHtml(c.domain)}" data-search="${escapeHtml((c.title + ' ' + c.description + ' ' + c.domain + ' course').toLowerCase())}">
        <div class="card-meta-line">
          <span class="meta-type-course">COURSE</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(c.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${c.lessons.length} Lessons</span>
        </div>
        <h2 class="card-title"><a href="${c.permalink}">${escapeHtml(c.title)}</a></h2>
        <p class="card-excerpt">${escapeHtml(c.description)}</p>
        <div class="card-chapter-links">
          ${c.lessons.map(l => `<a href="${l.permalink}" class="chapter-mini-link"><i class="bi bi-terminal"></i> ${escapeHtml(l.title)}</a>`).join('')}
        </div>
        <div class="card-footer-row">
          <a href="${c.permalink}" class="card-action-link">Open Course <i class="bi bi-arrow-up-right"></i></a>
        </div>
      </article>`).join('')}

      ${books.map(b => `
      <article class="studio-card library-item-card" data-type="book" data-domain="${escapeHtml(b.domain)}" data-search="${escapeHtml((b.title + ' ' + b.description + ' ' + b.domain + ' book monograph').toLowerCase())}">
        <div class="card-meta-line">
          <span class="meta-type-book">BOOK</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(b.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${b.chapters.length} Chapters</span>
        </div>
        <h2 class="card-title"><a href="${b.permalink}">${escapeHtml(b.title)}</a></h2>
        <p class="card-excerpt">${escapeHtml(b.description)}</p>
        <div class="card-chapter-links">
          ${b.chapters.map(ch => `<a href="${ch.permalink}" class="chapter-mini-link"><i class="bi bi-journal-text"></i> ${escapeHtml(ch.title)}</a>`).join('')}
        </div>
        <div class="card-footer-row">
          <a href="${b.permalink}" class="card-action-link">Read Monograph <i class="bi bi-arrow-right"></i></a>
        </div>
      </article>`).join('')}

      ${lessons.map(l => `
      <article class="studio-card library-item-card" data-type="lesson" data-domain="${escapeHtml(l.topic_domain)}" data-search="${escapeHtml((l.title + ' ' + l.description + ' ' + l.language + ' ' + l.topic_title + ' lesson').toLowerCase())}">
        <div class="card-meta-line">
          <span class="meta-type-lesson">LESSON</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(l.topic_domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml((LANG_LABELS[l.language] || l.language).toUpperCase())}</span>
        </div>
        <h2 class="card-title"><a href="${l.permalink}">${escapeHtml(l.title)}</a></h2>
        <p class="card-excerpt">${escapeHtml(l.description || `Interactive lesson in ${l.topic_title}.`)}</p>
        <div class="card-footer-row">
          <a href="${l.permalink}" class="card-action-link">Launch Lesson <i class="bi bi-arrow-right"></i></a>
        </div>
      </article>`).join('')}

      ${articles.map(a => `
      <article class="studio-card library-item-card" data-type="article" data-domain="${escapeHtml(a.domain)}" data-search="${escapeHtml((a.title + ' ' + a.description + ' ' + a.domain + ' article blog').toLowerCase())}">
        <div class="card-meta-line">
          <span class="meta-type-article">ARTICLE</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(a.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${a.readingTime} min read</span>
        </div>
        <h2 class="card-title"><a href="${a.permalink}">${escapeHtml(a.title)}</a></h2>
        <p class="card-excerpt">${escapeHtml(a.description)}</p>
        <div class="card-footer-row">
          <a href="${a.permalink}" class="card-action-link">Read Article <i class="bi bi-arrow-right"></i></a>
        </div>
      </article>`).join('')}
    </div>

    <div id="libraryEmptyState" class="library-empty-state d-none">
      <h3>No matching mathematical or code resources found</h3>
      <p>Try clearing your search query or switching to "All Domains".</p>
      <button type="button" class="btn-studio-secondary" id="libraryEmptyResetBtn">Show All Resources</button>
    </div>
  </div>
</div>`;

  writePage('library/index.html', renderPageShell({
    title: 'Library',
    description: 'Unified catalog of courses, mathematical monographs, Lean 4 formalizations, and research articles at Math Code Center.',
    permalink: '/library/',
    section: 'library',
    searchIndexJson,
    mainHtml: libraryMain
  }));

  // 4. Build Books Catalog (/public/books/index.html) & Individual Books + Chapters
  const booksCatalogMain = `
<div class="studio-scroll-page">
  <div class="studio-container">
    <header class="page-studio-header">
      <div class="studio-eyebrow">MATHEMATICAL MONOGRAPHS &amp; FORMAL TEXTBOOKS</div>
      <h1 class="page-studio-title">Books &amp; Monographs</h1>
      <p class="page-studio-subtitle">
        Rigorous, self-contained volumes on dependent type theory in Lean 4, spectral linear algebra, and real &amp; functional analysis—complete with LaTeX proofs and executable code.
      </p>
    </header>

    <div class="books-showcase-list">
      ${books.map(b => `
      <article class="book-showcase-card">
        <div class="book-showcase-cover">
          <a href="${b.permalink}">
            <img src="${b.cover}" alt="${escapeHtml(b.title)}" class="book-showcase-img">
          </a>
        </div>
        <div class="book-showcase-body">
          <div class="card-meta-line">
            <span class="meta-type-book">MONOGRAPH</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(b.domain)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(b.level)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${b.chapters.length} Chapters</span>
          </div>
          <h2 class="book-showcase-title"><a href="${b.permalink}">${escapeHtml(b.title)}</a></h2>
          ${b.subtitle ? `<p class="book-showcase-subtitle">${escapeHtml(b.subtitle)}</p>` : ''}
          <p class="book-showcase-desc">${escapeHtml(b.description)}</p>

          <div class="book-toc-preview">
            <div class="toc-preview-heading">Table of Contents</div>
            <div class="toc-preview-grid">
              ${b.chapters.map(ch => `
              <a href="${ch.permalink}" class="toc-chapter-row">
                <span class="toc-ch-num">Ch. ${ch.chapter}</span>
                <span class="toc-ch-title">${escapeHtml(ch.title)}</span>
                <span class="toc-ch-meta">${ch.readingTime} min read</span>
                <i class="bi bi-arrow-right toc-ch-arrow"></i>
              </a>`).join('')}
            </div>
          </div>

          <div class="book-showcase-actions">
            ${b.chapters[0] ? `<a href="${b.chapters[0].permalink}" class="btn-studio-primary"><i class="bi bi-book-half"></i> Start Reading Chapter 1</a>` : ''}
            <a href="${b.permalink}" class="btn-studio-secondary">Book Overview &amp; Syllabus</a>
          </div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</div>`;

  writePage('books/index.html', renderPageShell({
    title: 'Books & Monographs',
    description: 'Open-access mathematical monographs and code-driven textbooks on Lean 4 theorem proving, linear algebra, analysis, and scientific computing.',
    permalink: '/books/',
    section: 'books',
    searchIndexJson,
    mainHtml: booksCatalogMain
  }));

  for (const b of books) {
    const bookDetailMain = `
<div class="book-reader-layout">
  <aside class="book-reader-sidebar" id="bookReaderSidebar">
    <div class="book-sidebar-header">
      <a href="/books/" class="book-sidebar-back"><i class="bi bi-arrow-left"></i> All Monographs</a>
      <h2 class="book-sidebar-title">${escapeHtml(b.title)}</h2>
      <div class="card-meta-line">${escapeHtml(b.domain)} &middot; ${b.chapters.length} Chapters</div>
    </div>
    <nav class="book-sidebar-toc" aria-label="Book Chapters">
      <a href="${b.permalink}" class="book-toc-item active">
        <span class="toc-item-num">00</span>
        <span class="toc-item-text">Preface &amp; Overview</span>
      </a>
      ${b.chapters.map(ch => `
      <a href="${ch.permalink}" class="book-toc-item">
        <span class="toc-item-num">Ch. ${ch.chapter}</span>
        <span class="toc-item-text">${escapeHtml(ch.title)}</span>
      </a>`).join('')}
    </nav>
  </aside>

  <article class="book-reader-main">
    <div class="book-reader-prose">
      <nav class="studio-breadcrumb" aria-label="Breadcrumb">
        <a href="/library/">Library</a>
        <span>/</span>
        <a href="/books/">Books</a>
        <span>/</span>
        <span class="current">${escapeHtml(b.title)}</span>
      </nav>

      <header class="chapter-header">
        <div class="card-meta-line">
          <span class="meta-type-book">MONOGRAPH OVERVIEW</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(b.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(b.level)}</span>
        </div>
        <h1 class="chapter-title">${escapeHtml(b.title)}</h1>
        ${b.subtitle ? `<p class="chapter-lead">${escapeHtml(b.subtitle)}</p>` : ''}
      </header>

      <div class="markdown-body academic-prose">
        ${b.html}
      </div>

      <section class="chapter-directory-section">
        <h2 class="chapter-dir-heading">Chapters in this Volume</h2>
        <div class="chapter-dir-list">
          ${b.chapters.map(ch => `
          <a href="${ch.permalink}" class="chapter-dir-card">
            <div class="chapter-dir-top">
              <span class="chapter-dir-num">CHAPTER ${ch.chapter} &middot; ${ch.readingTime} MIN READ</span>
              <span class="chapter-dir-read">Read Chapter <i class="bi bi-arrow-right"></i></span>
            </div>
            <h3 class="chapter-dir-title">${escapeHtml(ch.title)}</h3>
            <p class="chapter-dir-desc">${escapeHtml(ch.description)}</p>
          </a>`).join('')}
        </div>
      </section>
    </div>
  </article>
</div>`;

    writePage(`books/${b.slug}/index.html`, renderPageShell({
      title: b.title,
      description: b.description,
      permalink: b.permalink,
      section: 'books',
      searchIndexJson,
      mainHtml: bookDetailMain
    }));

    b.chapters.forEach((ch, idx) => {
      const prevCh = idx > 0 ? b.chapters[idx - 1] : null;
      const nextCh = idx + 1 < b.chapters.length ? b.chapters[idx + 1] : null;

      const chapterMain = `
<div class="book-reader-layout">
  <aside class="book-reader-sidebar" id="bookReaderSidebar">
    <div class="book-sidebar-header">
      <a href="/books/" class="book-sidebar-back"><i class="bi bi-arrow-left"></i> All Monographs</a>
      <h2 class="book-sidebar-title"><a href="${b.permalink}">${escapeHtml(b.title)}</a></h2>
      <div class="card-meta-line">${escapeHtml(b.domain)} &middot; ${b.chapters.length} Chapters</div>
    </div>
    <nav class="book-sidebar-toc" aria-label="Book Chapters">
      <a href="${b.permalink}" class="book-toc-item">
        <span class="toc-item-num">00</span>
        <span class="toc-item-text">Preface &amp; Overview</span>
      </a>
      ${b.chapters.map(item => `
      <a href="${item.permalink}" class="book-toc-item${item.slug === ch.slug ? ' active' : ''}">
        <span class="toc-item-num">Ch. ${item.chapter}</span>
        <span class="toc-item-text">${escapeHtml(item.title)}</span>
      </a>`).join('')}
    </nav>
  </aside>

  <article class="book-reader-main">
    <div class="book-reader-prose">
      <nav class="studio-breadcrumb" aria-label="Breadcrumb">
        <a href="/library/">Library</a>
        <span>/</span>
        <a href="/books/">Books</a>
        <span>/</span>
        <a href="${b.permalink}">${escapeHtml(b.title)}</a>
      </nav>

      <header class="chapter-header">
        <div class="card-meta-line">
          <span class="meta-type-book">CHAPTER ${ch.chapter}</span>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(b.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${ch.readingTime} min read</span>
        </div>
        <h1 class="chapter-title">${escapeHtml(ch.title)}</h1>
        ${ch.description ? `<p class="chapter-lead">${escapeHtml(ch.description)}</p>` : ''}
      </header>

      <div id="autoPageToc" class="page-toc-box d-none"></div>

      <div class="markdown-body academic-prose">
        ${ch.html}
      </div>

      <nav class="chapter-pagination" aria-label="Chapter Navigation">
        ${prevCh ? `
        <a href="${prevCh.permalink}" class="chapter-nav-card prev">
          <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> Previous Chapter</span>
          <span class="chapter-nav-title">${escapeHtml(prevCh.title)}</span>
        </a>` : `
        <a href="${b.permalink}" class="chapter-nav-card prev">
          <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> Monograph Overview</span>
          <span class="chapter-nav-title">${escapeHtml(b.title)}</span>
        </a>`}

        ${nextCh ? `
        <a href="${nextCh.permalink}" class="chapter-nav-card next">
          <span class="chapter-nav-label">Next Chapter <i class="bi bi-arrow-right"></i></span>
          <span class="chapter-nav-title">${escapeHtml(nextCh.title)}</span>
        </a>` : `
        <a href="/books/" class="chapter-nav-card next">
          <span class="chapter-nav-label">Completed Monograph <i class="bi bi-check2-circle"></i></span>
          <span class="chapter-nav-title">Explore More Books in the Library</span>
        </a>`}
      </nav>
    </div>
  </article>
</div>`;

      writePage(`books/${b.slug}/${ch.slug}/index.html`, renderPageShell({
        title: `${ch.title} — ${b.title}`,
        description: ch.description || b.description,
        permalink: ch.permalink,
        section: 'books',
        searchIndexJson,
        mainHtml: chapterMain
      }));
    });
  }

  // 5. Build Blog Index (/public/blog/index.html) & Individual Articles
  const blogIndexMain = `
<div class="studio-scroll-page">
  <div class="studio-container">
    <header class="page-studio-header">
      <div class="studio-eyebrow">EXPOSITIONS, THEOREMS &amp; FORMALIZATIONS</div>
      <h1 class="page-studio-title">Research Essays &amp; Mathematical Blog</h1>
      <p class="page-studio-subtitle">
        Long-form technical articles on pure and applied mathematics, constructive proofs in Lean 4, spectral methods, and scientific algorithms.
      </p>

      <div class="library-controls-bar" id="blogFilterBar">
        <div class="library-search-wrap">
          <i class="bi bi-search library-search-icon"></i>
          <input type="search" id="blogSearchInput" class="library-search-input" placeholder="Search essays by theorem, topic, or code language..." autocomplete="off">
        </div>
        <div class="filter-segment-group" role="group" aria-label="Filter blog by domain">
          <button type="button" class="filter-seg-btn active" data-blog-domain="all">All Essays (${articles.length})</button>
          <button type="button" class="filter-seg-btn" data-blog-domain="Formal Proofs & Lean 4">Lean 4 &amp; Proofs</button>
          <button type="button" class="filter-seg-btn" data-blog-domain="Pure Math">Pure Math</button>
          <button type="button" class="filter-seg-btn" data-blog-domain="Applied Math">Applied Math</button>
        </div>
      </div>
    </header>

    <div class="articles-ledger" id="blogArticlesList">
      ${articles.map(a => `
      <article class="ledger-row blog-item-row" data-domain="${escapeHtml(a.domain)}" data-search="${escapeHtml((a.title + ' ' + a.description + ' ' + a.domain).toLowerCase())}">
        <div class="ledger-meta">
          <time datetime="${escapeHtml(a.date)}">${formatDate(a.date)}</time>
          <span class="meta-dot">&middot;</span>
          <span>${escapeHtml(a.domain)}</span>
          <span class="meta-dot">&middot;</span>
          <span>${a.readingTime} min read</span>
        </div>
        <h2 class="ledger-title"><a href="${a.permalink}">${escapeHtml(a.title)}</a></h2>
        <p class="ledger-desc">${escapeHtml(a.description)}</p>
        <a href="${a.permalink}" class="ledger-read-link">Read Full Article <i class="bi bi-arrow-right"></i></a>
      </article>`).join('')}
    </div>
  </div>
</div>`;

  writePage('blog/index.html', renderPageShell({
    title: 'Research Essays & Blog',
    description: 'Expository articles on pure and applied mathematics, Lean 4 formal proofs, numerical analysis, and scientific computing.',
    permalink: '/blog/',
    section: 'blog',
    searchIndexJson,
    mainHtml: blogIndexMain
  }));

  articles.forEach((a, idx) => {
    const prevArt = idx > 0 ? articles[idx - 1] : null;
    const nextArt = idx + 1 < articles.length ? articles[idx + 1] : null;

    const articleMain = `
<div class="studio-scroll-page">
  <article class="blog-reader-container">
    <nav class="studio-breadcrumb" aria-label="Breadcrumb">
      <a href="/library/">Library</a>
      <span>/</span>
      <a href="/blog/">Blog &amp; Essays</a>
      <span>/</span>
      <span class="current">${escapeHtml(a.title)}</span>
    </nav>

    <header class="chapter-header">
      <div class="card-meta-line">
        <span class="meta-type-article">RESEARCH ESSAY</span>
        <span class="meta-dot">&middot;</span>
        <time datetime="${escapeHtml(a.date)}">${formatLongDate(a.date)}</time>
        <span class="meta-dot">&middot;</span>
        <span>${escapeHtml(a.domain)}</span>
        <span class="meta-dot">&middot;</span>
        <span>${a.readingTime} min read</span>
      </div>
      <h1 class="chapter-title">${escapeHtml(a.title)}</h1>
      ${a.description ? `<p class="chapter-lead">${escapeHtml(a.description)}</p>` : ''}
    </header>

    <div id="autoPageToc" class="page-toc-box d-none"></div>

    <div class="markdown-body academic-prose">
      ${a.html}
    </div>

    <nav class="chapter-pagination" aria-label="Essay Navigation">
      ${prevArt ? `
      <a href="${prevArt.permalink}" class="chapter-nav-card prev">
        <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> Newer Essay</span>
        <span class="chapter-nav-title">${escapeHtml(prevArt.title)}</span>
      </a>` : `
      <a href="/blog/" class="chapter-nav-card prev">
        <span class="chapter-nav-label"><i class="bi bi-arrow-left"></i> All Research Essays</span>
        <span class="chapter-nav-title">Browse the Blog Index</span>
      </a>`}

      ${nextArt ? `
      <a href="${nextArt.permalink}" class="chapter-nav-card next">
        <span class="chapter-nav-label">Next Essay <i class="bi bi-arrow-right"></i></span>
        <span class="chapter-nav-title">${escapeHtml(nextArt.title)}</span>
      </a>` : `
      <a href="/library/" class="chapter-nav-card next">
        <span class="chapter-nav-label">Unified Library <i class="bi bi-collection"></i></span>
        <span class="chapter-nav-title">Explore Courses, Books &amp; Proofs</span>
      </a>`}
    </nav>
  </article>
</div>`;

    writePage(`blog/${a.slug}/index.html`, renderPageShell({
      title: a.title,
      description: a.description,
      permalink: a.permalink,
      section: 'blog',
      searchIndexJson,
      mainHtml: articleMain
    }));
  });

  // 6. Build Courses Catalog (/public/courses/index.html), Course Overviews, and Lesson Studios
  const coursesCatalogMain = `
<div class="studio-scroll-page">
  <div class="studio-container">
    <header class="page-studio-header">
      <div class="studio-eyebrow">STRUCTURED CURRICULUM &middot; LECTURES, FORMAL CODE &amp; QUIZZES</div>
      <h1 class="page-studio-title">Interactive Mathematics &amp; Code Courses</h1>
      <p class="page-studio-subtitle">
        Rigorous courses combining LaTeX mathematical derivations, constructive proofs in Lean 4, scientific implementations in Python, C, and Rust, and interactive self-check quizzes.
      </p>

      <div class="library-controls-bar" id="coursesFilterBar">
        <div class="library-search-wrap">
          <i class="bi bi-search library-search-icon"></i>
          <input type="search" id="coursesSearchInput" class="library-search-input" placeholder="Search courses, modules, or lessons (e.g. Lean 4, Spectral, Symplectic)..." autocomplete="off">
        </div>
        <div class="filter-segment-group" role="group" aria-label="Filter courses by domain">
          <button type="button" class="filter-seg-btn active" data-course-domain="all">All Domains (${courses.length})</button>
          <button type="button" class="filter-seg-btn" data-course-domain="Formal Proofs & Lean 4">Lean 4 &amp; Proofs</button>
          <button type="button" class="filter-seg-btn" data-course-domain="Pure Math">Pure Math</button>
          <button type="button" class="filter-seg-btn" data-course-domain="Applied Math">Applied Math</button>
        </div>
      </div>
    </header>

    <div class="books-showcase-list" id="coursesCatalogList">
      ${courses.map(c => `
      <article class="book-showcase-card course-catalog-card" data-domain="${escapeHtml(c.domain)}" data-search="${escapeHtml((c.title + ' ' + c.description + ' ' + c.lessons.map(l => l.title).join(' ')).toLowerCase())}">
        <div class="book-showcase-body" style="grid-column: 1 / -1;">
          <div class="card-meta-line">
            <span class="meta-type-course">COURSE TRACK</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(c.domain)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${escapeHtml(c.level)}</span>
            <span class="meta-dot">&middot;</span>
            <span>${c.lessons.length} Lessons</span>
          </div>
          <h2 class="book-showcase-title"><a href="${c.permalink}">${escapeHtml(c.title)}</a></h2>
          <p class="book-showcase-desc">${escapeHtml(c.description)}</p>

          <div class="book-toc-preview">
            <div class="toc-preview-heading">Curriculum Lessons</div>
            <div class="toc-preview-grid">
              ${c.lessons.map((l, idx) => `
              <a href="${l.permalink}" class="toc-chapter-row" data-lesson-id="${escapeHtml(l.id)}">
                <span class="toc-ch-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="toc-ch-title">${escapeHtml(l.title)}</span>
                <span class="toc-ch-meta">${escapeHtml((LANG_LABELS[l.language] || l.language).toUpperCase())}</span>
                <i class="bi bi-arrow-right toc-ch-arrow"></i>
              </a>`).join('')}
            </div>
          </div>

          <div class="book-showcase-actions">
            ${c.lessons[0] ? `<a href="${c.lessons[0].permalink}" class="btn-studio-primary"><i class="bi bi-play-fill"></i> Start Lesson 1: ${escapeHtml(c.lessons[0].title)}</a>` : ''}
            <a href="${c.permalink}" class="btn-studio-secondary">Course Syllabus &amp; Overview</a>
          </div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</div>`;

  writePage('courses/index.html', renderPageShell({
    title: 'Interactive Courses',
    description: 'Interactive courses on Lean 4 theorem proving, pure mathematics, and applied scientific computing.',
    permalink: '/courses/',
    section: 'courses',
    searchIndexJson,
    mainHtml: coursesCatalogMain
  }));

  for (const c of courses) {
    const firstLesson = c.lessons[0] || null;
    const courseLessonsListHtml = c.lessons.length > 0 ? `
      <section class="chapter-directory-section">
        <h2 class="chapter-dir-heading">Course Curriculum (${c.lessons.length} Lessons)</h2>
        <div class="chapter-dir-list">
          ${c.lessons.map((l, idx) => `
          <a href="${l.permalink}" class="chapter-dir-card">
            <div class="chapter-dir-top">
              <span class="chapter-dir-num">LESSON ${idx + 1} &middot; ${escapeHtml(humanizeSlug(l.subtopic))} &middot; ${escapeHtml((LANG_LABELS[l.language] || l.language).toUpperCase())}</span>
              <span class="chapter-dir-read">Launch Lesson <i class="bi bi-arrow-right"></i></span>
            </div>
            <h3 class="chapter-dir-title">${escapeHtml(l.title)}</h3>
            <p class="chapter-dir-desc">${escapeHtml(l.description || `Interactive lecture, code formalization, and concept quiz.`)}</p>
          </a>`).join('')}
        </div>
      </section>` : '';

    const coursePageMain = renderCoursePlatformHtml({
      activeId: `intro-${c.slug}`,
      title: c.title,
      description: c.description,
      language: '',
      difficulty: c.level,
      readingTime: estimateReadingTime(c.body),
      activeCourse: c,
      isCourseIntro: true,
      explanationHtml: c.html + courseLessonsListHtml,
      readingHtml: '',
      codes: {},
      quizQuestions: [],
      prevItem: { label: 'All Courses', title: 'Interactive Courses Catalog', permalink: '/courses/' },
      nextItem: firstLesson ? { label: 'Start Lesson 1', title: firstLesson.title, permalink: firstLesson.permalink } : null
    });

    writePage(`courses/${c.slug}/index.html`, renderPageShell({
      title: c.title,
      description: c.description,
      permalink: c.permalink,
      section: 'courses',
      searchIndexJson,
      mainHtml: coursePageMain
    }));

    c.lessons.forEach((l, idx) => {
      const prevLesson = idx > 0 ? c.lessons[idx - 1] : null;
      const nextLesson = idx + 1 < c.lessons.length ? c.lessons[idx + 1] : null;

      const lessonPageMain = renderCoursePlatformHtml({
        activeId: l.id,
        title: l.title,
        description: l.description,
        language: l.language,
        difficulty: l.difficulty,
        readingTime: l.readingTime,
        activeCourse: c,
        isCourseIntro: false,
        explanationHtml: l.explanationHtml,
        readingHtml: l.readingHtml,
        codes: l.codes,
        quizQuestions: l.quizQuestions,
        prevItem: prevLesson
          ? { label: `Previous (Lesson ${idx})`, title: prevLesson.title, permalink: prevLesson.permalink }
          : { label: 'Course Overview', title: c.title, permalink: c.permalink },
        nextItem: nextLesson
          ? { label: `Next (Lesson ${idx + 2})`, title: nextLesson.title, permalink: nextLesson.permalink }
          : null
      });

      writePage(l.relativeOutPath, renderPageShell({
        title: `${l.title} — ${c.title}`,
        description: l.description || `${l.title} in ${c.title}`,
        permalink: l.permalink,
        section: 'courses',
        searchIndexJson,
        mainHtml: lessonPageMain
      }));
    });
  }

  console.log(`Built Math Code Center static site in public/: ${courses.length} courses (${lessons.length} lessons), ${books.length} books, ${articles.length} blog essays, and ${searchIndex.length} searchable entries.`);
}

buildAll();
