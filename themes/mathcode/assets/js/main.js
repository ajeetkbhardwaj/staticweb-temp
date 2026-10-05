/* ==========================================================================
   MATH CODE CENTER — ULTRA-LIGHTWEIGHT STATIC STUDIO ENGINE
   100% Static (GitHub Pages / GitLab Pages Compatible)
   ========================================================================== */

(function() {
  'use strict';

  var THEME_KEY = 'mathcode-theme';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* --------------------------------------------------------------------------
     1. THEME TOGGLE (Dark Academic Studio <-> Warm Ivory Paper)
     -------------------------------------------------------------------------- */
  function updateThemeIcon(theme) {
    var icon = document.getElementById('themeToggleIcon');
    if (!icon) return;
    icon.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
  }

  function initThemeToggle() {
    var current = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    updateThemeIcon(current);

    var btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var active = document.documentElement.getAttribute('data-bs-theme') || 'dark';
      var next = active === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      updateThemeIcon(next);
    });
  }

  /* --------------------------------------------------------------------------
     2. LEAN 4 GRAMMAR, CODE BLOCK ENHANCER & KATEX AUTO-RENDER
     -------------------------------------------------------------------------- */
  var leanGrammarRegistered = false;

  function registerLean4Grammar() {
    if (leanGrammarRegistered || typeof hljs === 'undefined') return;
    try {
      var leanDef = function(hljsInstance) {
        return {
          name: 'Lean 4',
          aliases: ['lean', 'lean4'],
          keywords: {
            keyword:
              'theorem lemma def abbrev structure class instance inductive where ' +
              'axiom example opaque noncomputable private protected mutual ' +
              'variable universe open namespace end section import ' +
              'by exact apply intro intros rfl rw rewrite simp dsimp ' +
              'cases rcases induction constructor Obtain obtain have show from ' +
              'calc fun match with if then else let in do return ' +
              'ring linarith omega decide tauto contradiction sorry',
            built_in:
              'Type Prop Sort Nat Int Real Rat Bool List Array VectorFin Option ' +
              'And Or Not Iff Exists Eq True False Injective Surjective Bijective',
            literal: 'true false'
          },
          contains: [
            hljsInstance.COMMENT('--', '$'),
            hljsInstance.COMMENT('/-', '-/'),
            hljsInstance.QUOTE_STRING_MODE,
            hljsInstance.C_NUMBER_MODE
          ]
        };
      };
      hljs.registerLanguage('lean', leanDef);
      hljs.registerLanguage('lean4', leanDef);
      leanGrammarRegistered = true;
    } catch (e) {}
  }

  var LANG_LABELS = {
    lean: 'Lean 4',
    lean4: 'Lean 4',
    python: 'Python',
    py: 'Python',
    c: 'C',
    cpp: 'C++',
    rust: 'Rust',
    rs: 'Rust',
    julia: 'Julia',
    bash: 'Shell',
    sh: 'Shell',
    text: 'Code'
  };

  function enhanceCodeBlocks(root) {
    var container = root || document;
    registerLean4Grammar();

    var preElements = container.querySelectorAll('.markdown-body pre, .academic-prose pre');
    preElements.forEach(function(pre) {
      if (pre.closest('.code-block') || pre.closest('.hero-proof-overlay')) return;
      var codeEl = pre.querySelector('code');
      if (!codeEl) return;

      var lang = 'text';
      var classList = Array.prototype.slice.call(codeEl.classList || []);
      classList.forEach(function(cls) {
        if (cls.indexOf('language-') === 0) {
          lang = cls.replace('language-', '').toLowerCase();
        }
      });

      var label = LANG_LABELS[lang] || lang.toUpperCase();
      var rawText = (codeEl.textContent || '').replace(/\n$/, '');
      var lines = rawText.split('\n');

      var wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      wrapper.setAttribute('data-lang', lang);

      var header = document.createElement('div');
      header.className = 'code-block-header';

      var langSpan = document.createElement('span');
      langSpan.className = 'code-lang-label';
      langSpan.textContent = label;

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(rawText).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() { copyBtn.textContent = 'Copy'; }, 1500);
        });
      });

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      var body = document.createElement('div');
      body.className = 'code-block-body';

      var lineNums = document.createElement('div');
      lineNums.className = 'code-line-numbers';
      lineNums.setAttribute('aria-hidden', 'true');
      lineNums.innerHTML = lines.map(function(_, i) { return '<span>' + (i + 1) + '</span>'; }).join('');

      pre.parentNode.insertBefore(wrapper, pre);
      body.appendChild(lineNums);
      body.appendChild(pre);
      wrapper.appendChild(header);
      wrapper.appendChild(body);
    });

    if (typeof hljs !== 'undefined') {
      var codes = container.querySelectorAll('pre code:not([data-highlighted="yes"])');
      codes.forEach(function(block) {
        try {
          hljs.highlightElement(block);
        } catch (e) {}
      });
    }
  }

  function renderLatexInRoot(root) {
    var target = root || document.body;
    if (!target || typeof renderMathInElement !== 'function') return;
    try {
      renderMathInElement(target, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      });
    } catch (e) {}
  }

  function refreshMathAndCode(root) {
    enhanceCodeBlocks(root || document);
    renderLatexInRoot(root || document.body);
  }

  /* --------------------------------------------------------------------------
     3. AUTOMATIC "ON THIS PAGE" TABLE OF CONTENTS
     -------------------------------------------------------------------------- */
  function initAutoPageToc() {
    var tocBox = document.getElementById('autoPageToc');
    if (!tocBox) return;

    var scope = document.querySelector('.course-reader-prose') ||
                document.querySelector('.book-reader-prose') ||
                document.querySelector('.blog-reader-container');
    if (!scope) return;

    var headings = Array.prototype.slice.call(scope.querySelectorAll('h2, h3')).filter(function(h) {
      return !h.closest('.chapter-directory-section');
    });
    if (headings.length < 2) return;

    var itemsHtml = headings.map(function(h, idx) {
      var text = (h.textContent || '').trim();
      var slug = h.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('section-' + (idx + 1));
      h.id = slug;
      var isSub = h.tagName.toLowerCase() === 'h3';
      return '<a href="#' + escapeHtml(slug) + '" class="page-toc-link' + (isSub ? ' page-toc-sub' : '') + '">' +
        escapeHtml(text) +
      '</a>';
    }).join('');

    tocBox.innerHTML =
      '<div class="page-toc-header">' +
        '<span class="page-toc-title"><i class="bi bi-list-nested me-1"></i> On This Page</span>' +
        '<span class="page-toc-count">' + headings.length + ' sections</span>' +
      '</div>' +
      '<nav class="page-toc-nav" aria-label="On this page">' + itemsHtml + '</nav>';
    tocBox.classList.remove('d-none');
  }

  /* --------------------------------------------------------------------------
     4. RESPONSIVE MOBILE DRAWER & SIDEBAR COLLAPSE
     -------------------------------------------------------------------------- */
  function initResponsiveDrawers() {
    var mobileBtn = document.getElementById('mobileNavToggleBtn');
    var mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', function() {
        mobileDrawer.classList.toggle('d-none');
      });
    }

    var sidebarPane = document.getElementById('sidebarPane') || document.getElementById('bookReaderSidebar');
    var layoutContainer = document.getElementById('platformLayout') || document.querySelector('.book-reader-layout');
    var sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    var sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');

    function toggleSidebar() {
      if (!sidebarPane) return;
      sidebarPane.classList.toggle('sidebar-collapsed');
      if (layoutContainer) {
        layoutContainer.classList.toggle('has-collapsed-sidebar', sidebarPane.classList.contains('sidebar-collapsed'));
      }
    }

    if (sidebarPane && sidebarToggleBtn) {
      sidebarToggleBtn.classList.remove('d-none');
      sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    if (sidebarPane && sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', toggleSidebar);
    }
  }

  /* --------------------------------------------------------------------------
     5. GLOBAL SEARCH PALETTE (Ctrl+K / Cmd+K / /)
     -------------------------------------------------------------------------- */
  function initGlobalSearch() {
    var openBtn = document.getElementById('globalSearchBtn');
    var modal = document.getElementById('globalSearchModal');
    var closeBtn = document.getElementById('globalSearchCloseBtn');
    var input = document.getElementById('globalSearchInput');
    var resultsEl = document.getElementById('globalSearchResults');
    var typeBtns = document.querySelectorAll('[data-search-type]');

    if (!modal || !input || !resultsEl) return;

    var searchIndex = [];
    var embeddedEl = document.getElementById('global-search-index');
    if (embeddedEl) {
      try { searchIndex = JSON.parse(embeddedEl.textContent) || []; } catch (e) {}
    }

    var activeType = 'all';
    var selectedIdx = 0;
    var filteredItems = [];

    function renderResults() {
      var q = (input.value || '').trim().toLowerCase();
      filteredItems = searchIndex.filter(function(item) {
        var matchType = activeType === 'all' || item.category === activeType;
        if (!matchType) return false;
        if (!q) return true;
        var hay = (item.title + ' ' + (item.subtitle || '') + ' ' + (item.domain || '') + ' ' + (item.typeLabel || '')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (selectedIdx >= filteredItems.length) selectedIdx = 0;

      if (filteredItems.length === 0) {
        resultsEl.innerHTML = '<div class="search-empty-state">No matching courses, chapters, or essays found.</div>';
        return;
      }

      resultsEl.innerHTML = filteredItems.slice(0, 20).map(function(item, idx) {
        var activeCls = idx === selectedIdx ? ' active' : '';
        return '<a href="' + escapeHtml(item.url) + '" class="search-result-item' + activeCls + '" data-result-idx="' + idx + '">' +
          '<div class="search-result-main">' +
            '<span class="search-result-badge search-badge-' + escapeHtml(item.category) + '">' + escapeHtml(item.typeLabel) + '</span>' +
            '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
          '</div>' +
          '<div class="search-result-meta">' +
            '<span>' + escapeHtml(item.domain || 'Mathematics & Code') + '</span>' +
            (item.subtitle ? ' &middot; <span>' + escapeHtml(item.subtitle) + '</span>' : '') +
          '</div>' +
        '</a>';
      }).join('');
    }

    function openSearch() {
      modal.classList.remove('d-none');
      selectedIdx = 0;
      renderResults();
      setTimeout(function() { input.focus(); input.select(); }, 20);
    }

    function closeSearch() {
      modal.classList.add('d-none');
    }

    if (openBtn) openBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeSearch();
    });

    typeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        typeBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeType = btn.getAttribute('data-search-type') || 'all';
        selectedIdx = 0;
        renderResults();
        input.focus();
      });
    });

    input.addEventListener('input', function() {
      selectedIdx = 0;
      renderResults();
    });

    document.addEventListener('keydown', function(e) {
      var isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      var isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes((document.activeElement || {}).tagName);

      if (isCmdK || isSlash) {
        e.preventDefault();
        if (modal.classList.contains('d-none')) openSearch();
        else closeSearch();
        return;
      }

      if (modal.classList.contains('d-none')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          selectedIdx = (selectedIdx + 1) % Math.min(filteredItems.length, 20);
          renderResults();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          var max = Math.min(filteredItems.length, 20);
          selectedIdx = (selectedIdx - 1 + max) % max;
          renderResults();
        }
      } else if (e.key === 'Enter' && filteredItems[selectedIdx]) {
        e.preventDefault();
        window.location.href = filteredItems[selectedIdx].url;
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. COURSE STUDIO: SIDEBAR FILTER, SECTION TABS, CODE SWITCHER & QUIZ
     -------------------------------------------------------------------------- */
  function initCourseStudio() {
    var questionList = document.getElementById('questionList');
    var searchInput = document.getElementById('questionSearch');
    if (searchInput && questionList) {
      searchInput.addEventListener('input', function() {
        var q = (searchInput.value || '').trim().toLowerCase();
        var moduleGroups = questionList.querySelectorAll('.sidebar-module-group');
        if (moduleGroups.length > 0) {
          moduleGroups.forEach(function(group) {
            var links = group.querySelectorAll('.sidebar-lesson-link');
            var anyVisible = false;
            links.forEach(function(link) {
              var text = (link.getAttribute('data-search') || '') + ' ' + (link.textContent || '').toLowerCase();
              var match = !q || text.indexOf(q) !== -1;
              link.classList.toggle('d-none', !match);
              if (match) anyVisible = true;
            });
            group.classList.toggle('d-none', !anyVisible);
          });
        } else {
          var links = questionList.querySelectorAll('.sidebar-lesson-link');
          links.forEach(function(link) {
            var text = (link.getAttribute('data-search') || '') + ' ' + (link.textContent || '').toLowerCase();
            var match = !q || text.indexOf(q) !== -1;
            link.classList.toggle('d-none', !match);
          });
        }
      });
    }

    // Center content tabs (Full Lesson / Lecture & Proofs / Reading & Code / Quiz)
    var tabAll = document.getElementById('tabAll');
    var tabArticle = document.getElementById('tabArticle');
    var tabReading = document.getElementById('tabReading');
    var tabQuiz = document.getElementById('tabQuiz');
    var lecturePane = document.getElementById('lectureTabPane');
    var readingPane = document.getElementById('readingTabPane');
    var quizPane = document.getElementById('quizTabPane');
    var tocBox = document.getElementById('autoPageToc');

    function activateCenterTab(target) {
      [tabAll, tabArticle, tabReading, tabQuiz].forEach(function(t) {
        if (t) t.classList.remove('active');
      });

      if (target === 'lecture') {
        if (tabArticle) tabArticle.classList.add('active');
        if (lecturePane) lecturePane.classList.remove('d-none');
        if (readingPane) readingPane.classList.add('d-none');
        if (quizPane) quizPane.classList.add('d-none');
        if (tocBox && tocBox.innerHTML.trim()) tocBox.classList.remove('d-none');
        refreshMathAndCode(lecturePane);
      } else if (target === 'reading') {
        if (tabReading) tabReading.classList.add('active');
        if (lecturePane) lecturePane.classList.add('d-none');
        if (readingPane) readingPane.classList.remove('d-none');
        if (quizPane) quizPane.classList.add('d-none');
        if (tocBox) tocBox.classList.add('d-none');
        refreshMathAndCode(readingPane);
      } else if (target === 'quiz') {
        if (tabQuiz) tabQuiz.classList.add('active');
        if (lecturePane) lecturePane.classList.add('d-none');
        if (readingPane) readingPane.classList.add('d-none');
        if (quizPane) quizPane.classList.remove('d-none');
        if (tocBox) tocBox.classList.add('d-none');
        refreshMathAndCode(quizPane);
      } else {
        if (tabAll) tabAll.classList.add('active');
        if (lecturePane) lecturePane.classList.remove('d-none');
        if (readingPane) readingPane.classList.remove('d-none');
        if (quizPane) quizPane.classList.remove('d-none');
        if (tocBox && tocBox.innerHTML.trim()) tocBox.classList.remove('d-none');
        refreshMathAndCode(document);
      }
    }

    if (tabAll) tabAll.addEventListener('click', function() { activateCenterTab('all'); });
    if (tabArticle) tabArticle.addEventListener('click', function() { activateCenterTab('lecture'); });
    if (tabReading) tabReading.addEventListener('click', function() { activateCenterTab('reading'); });
    if (tabQuiz) tabQuiz.addEventListener('click', function() { activateCenterTab('quiz'); });

    // Multi-language code switcher inside .code-solutions
    document.querySelectorAll('.code-solutions').forEach(function(sol) {
      var btns = sol.querySelectorAll('.code-lang-btn');
      var panels = sol.querySelectorAll('.code-lang-content');
      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var targetLang = btn.getAttribute('data-lang');
          btns.forEach(function(b) { b.classList.toggle('active', b === btn); });
          panels.forEach(function(p) {
            p.classList.toggle('d-none', p.getAttribute('data-lang') !== targetLang);
          });
          refreshMathAndCode(sol);
        });
      });
    });

    // Interactive Self-Check Quiz
    var quizRendered = document.getElementById('quizRendered');
    if (quizRendered) {
      var cards = quizRendered.querySelectorAll('.quiz-card');
      cards.forEach(function(card) {
        var options = card.querySelectorAll('.quiz-option');
        var expBox = card.querySelector('.quiz-explanation');

        options.forEach(function(opt) {
          var radio = opt.querySelector('input[type="radio"]');
          if (!radio) return;
          radio.addEventListener('change', function() {
            var isCorrect = opt.getAttribute('data-correct') === 'true';
            options.forEach(function(o) { o.classList.remove('correct', 'wrong'); });
            if (isCorrect) {
              opt.classList.add('correct');
              if (expBox) {
                expBox.classList.remove('d-none');
                refreshMathAndCode(expBox);
              }
            } else {
              opt.classList.add('wrong');
            }
          });
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. UNIFIED LIBRARY, COURSES CATALOG & BLOG FILTERS
     -------------------------------------------------------------------------- */
  function matchesDomainFilter(itemDomain, activeFilter) {
    if (!activeFilter || activeFilter === 'all') return true;
    var item = (itemDomain || '').toLowerCase();
    var target = activeFilter.toLowerCase();
    if (item === target) return true;
    if (target.indexOf('lean') !== -1 || target.indexOf('proof') !== -1) {
      return item.indexOf('lean') !== -1 || item.indexOf('proof') !== -1;
    }
    if (target.indexOf('pure') !== -1) {
      return item.indexOf('pure') !== -1;
    }
    if (target.indexOf('applied') !== -1) {
      return item.indexOf('applied') !== -1;
    }
    return item.indexOf(target) !== -1;
  }

  function initLibraryFilters() {
    var grid = document.getElementById('libraryCatalogGrid');
    if (!grid) return;

    var searchInput = document.getElementById('librarySearchInput');
    var typeBtns = document.querySelectorAll('[data-filter-type]');
    var domainBtns = document.querySelectorAll('[data-filter-domain]');
    var countEl = document.getElementById('libraryResultCount');
    var resetBtn = document.getElementById('libraryResetBtn');
    var emptyState = document.getElementById('libraryEmptyState');
    var emptyResetBtn = document.getElementById('libraryEmptyResetBtn');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.library-item-card'));

    var activeType = 'all';
    var activeDomain = 'all';
    var query = '';

    function applyFilters() {
      var visibleCount = 0;
      var q = query.trim().toLowerCase();

      cards.forEach(function(card) {
        var cType = card.getAttribute('data-type') || '';
        var cDomain = card.getAttribute('data-domain') || '';
        var cSearch = (card.getAttribute('data-search') || '') + ' ' + (card.textContent || '').toLowerCase();

        var matchType = activeType === 'all' || cType === activeType;
        var matchDomain = matchesDomainFilter(cDomain, activeDomain);
        var matchQuery = !q || cSearch.indexOf(q) !== -1;

        if (matchType && matchDomain && matchQuery) {
          card.classList.remove('d-none');
          visibleCount++;
        } else {
          card.classList.add('d-none');
        }
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visibleCount + ' of ' + cards.length + ' resources';
      }

      var isFiltered = activeType !== 'all' || activeDomain !== 'all' || q.length > 0;
      if (resetBtn) resetBtn.classList.toggle('d-none', !isFiltered);
      if (emptyState) emptyState.classList.toggle('d-none', visibleCount > 0);
    }

    typeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        typeBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeType = btn.getAttribute('data-filter-type') || 'all';
        applyFilters();
      });
    });

    domainBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        domainBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeDomain = btn.getAttribute('data-filter-domain') || 'all';
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        query = searchInput.value || '';
        applyFilters();
      });
    }

    function resetAll() {
      activeType = 'all';
      activeDomain = 'all';
      query = '';
      if (searchInput) searchInput.value = '';
      typeBtns.forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-filter-type') === 'all');
      });
      domainBtns.forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-filter-domain') === 'all');
      });
      applyFilters();
    }

    if (resetBtn) resetBtn.addEventListener('click', resetAll);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);

    applyFilters();
  }

  function initCoursesCatalogFilters() {
    var list = document.getElementById('coursesCatalogList');
    if (!list) return;
    var searchInput = document.getElementById('coursesSearchInput');
    var domainBtns = document.querySelectorAll('[data-course-domain]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.course-catalog-card'));
    var activeDomain = 'all';
    var query = '';

    function applyFilter() {
      var q = query.trim().toLowerCase();
      cards.forEach(function(card) {
        var dom = card.getAttribute('data-domain') || '';
        var text = (card.getAttribute('data-search') || '') + ' ' + (card.textContent || '').toLowerCase();
        var matchDomain = matchesDomainFilter(dom, activeDomain);
        var matchQ = !q || text.indexOf(q) !== -1;
        card.classList.toggle('d-none', !(matchDomain && matchQ));
      });
    }

    domainBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        domainBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeDomain = btn.getAttribute('data-course-domain') || 'all';
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        query = searchInput.value || '';
        applyFilter();
      });
    }
  }

  function initBlogFilters() {
    var list = document.getElementById('blogArticlesList');
    if (!list) return;
    var searchInput = document.getElementById('blogSearchInput');
    var domainBtns = document.querySelectorAll('[data-blog-domain]');
    var rows = Array.prototype.slice.call(list.querySelectorAll('.blog-item-row'));
    var activeDomain = 'all';
    var query = '';

    function applyBlogFilter() {
      var q = query.trim().toLowerCase();
      rows.forEach(function(row) {
        var dom = row.getAttribute('data-domain') || '';
        var text = (row.getAttribute('data-search') || '') + ' ' + (row.textContent || '').toLowerCase();
        var matchDomain = matchesDomainFilter(dom, activeDomain);
        var matchQ = !q || text.indexOf(q) !== -1;
        row.classList.toggle('d-none', !(matchDomain && matchQ));
      });
    }

    domainBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        domainBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeDomain = btn.getAttribute('data-blog-domain') || 'all';
        applyBlogFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        query = searchInput.value || '';
        applyBlogFilter();
      });
    }
  }

  function bootMathCodeStudio() {
    initThemeToggle();
    initResponsiveDrawers();
    initAutoPageToc();
    initGlobalSearch();
    initCourseStudio();
    initLibraryFilters();
    initCoursesCatalogFilters();
    initBlogFilters();
    refreshMathAndCode(document);
    setTimeout(function() { refreshMathAndCode(document); }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootMathCodeStudio);
  } else {
    bootMathCodeStudio();
  }
})();
