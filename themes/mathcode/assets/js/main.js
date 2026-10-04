const difficultyClasses = {
  easy: 'text-bg-success',
  medium: 'text-bg-warning',
  hard: 'text-bg-danger',
};

const statusClasses = {
  Unattempted: 'text-bg-secondary',
  'In Progress': 'text-bg-warning',
  Compiled: 'text-bg-info',
  Accepted: 'text-bg-success',
  Wrong: 'text-bg-danger',
  'Compilation Error': 'text-bg-danger',
  'Runtime Error': 'text-bg-danger',
};

// Maps a lesson/file language identifier (front matter `language`, shortcode
// `lang`, or fenced code block language) to a CodeMirror mode.
const languageModes = {
  c: 'text/x-csrc',
  cpp: 'text/x-c++src',
  cs: 'text/x-csharp',
  python: 'python',
  py: 'python',
  assembly: 'gas',
  asm: 'gas',
  gas: 'gas',
  s: 'gas',
  ld: 'gas',
  bash: 'text/x-sh',
  sh: 'text/x-sh',
  shell: 'text/x-sh',
  makefile: 'text/x-sh',
  mk: 'text/x-sh',
  text: 'text/plain',
  plaintext: 'text/plain',
};

function langToMode(lang) {
  if (!lang) return 'text/plain';
  return languageModes[String(lang).toLowerCase()] || 'text/plain';
}

// Display label for a file language (e.g. "c" -> "C", "asm" -> "Assembly").
const languageLabels = {
  c: 'C', cpp: 'C++', cs: 'C#', python: 'Python', py: 'Python',
  assembly: 'Assembly', asm: 'Assembly', gas: 'Assembly', s: 'Assembly', ld: 'Linker Script',
  bash: 'Bash', sh: 'Shell', shell: 'Shell', makefile: 'Makefile', mk: 'Makefile',
  text: 'Text', plaintext: 'Text',
};

function langToLabel(lang) {
  if (!lang) return '';
  return languageLabels[String(lang).toLowerCase()] || String(lang).toUpperCase();
}

const htmlEl = document.documentElement;
const problemDataEl = document.getElementById('problem-data');
const activeProblemInput = document.getElementById('active-problem-id');
const questionListEl = document.getElementById('questionList');
const questionSearchEl = document.getElementById('questionSearch');
const questionContentEl = document.getElementById('questionContent');
const articleContentEl = document.getElementById('articleContent');
const readingTabContentEl = document.getElementById('readingTabContent');
const quizContentEl = document.getElementById('quizContent');
const tabChallenge = document.getElementById('tabChallenge');
const tabArticle = document.getElementById('tabArticle');
const tabReading = document.getElementById('tabReading');
const tabQuiz = document.getElementById('tabQuiz');
const difficultyBadgeEl = document.getElementById('difficultyBadge');
const codeEditorEl = document.getElementById('codeEditor');
const codeEditorWrapper = document.getElementById('codeEditorWrapper');
const languageLabelEl = document.getElementById('languageLabel');
const consoleOutputEl = document.getElementById('consoleOutput');
const statusTextEl = document.getElementById('statusText');
const runBtn = document.getElementById('runBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const fileTabs = document.getElementById('fileTabs');
const clearConsoleBtn = document.getElementById('clearConsole');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const sidebarPane = document.getElementById('sidebarPane');
const editorPane = document.getElementById('editorPane');
const questionPane = document.getElementById('questionPane');
const consoleArea = document.getElementById('consoleArea');
const editorArea = document.getElementById('editorArea');
const resizerCasesCase = document.getElementById('resizerCasesCase');
const resizerCaseWorkspace = document.getElementById('resizerCaseWorkspace');
const resizerEditorConsole = document.getElementById('resizerEditorConsole');
const questionPaneBody = document.getElementById('questionPaneBody');
const notesArea = document.getElementById('notesArea');
const notesEditorEl = document.getElementById('notesEditor');
const notesEditorWrapper = document.getElementById('notesEditorWrapper');
const notesPreviewEl = document.getElementById('notesPreview');
const notesModeBtn = document.getElementById('notesModeBtn');
const exportNotesMenuItem = document.getElementById('exportNotesMenuItem');
const exportPdfMenuItem = document.getElementById('exportPdfMenuItem');
const notesMinimizeBtn = document.getElementById('notesMinimizeBtn');
const notesMaximizeBtn = document.getElementById('notesMaximizeBtn');
const notesRestoreBtn = document.getElementById('notesRestoreBtn');
const resizerQuestionNotes = document.getElementById('resizerQuestionNotes');

const SUBMISSIONS_STORAGE_KEY = 'pyjamacode-submissions';
const NOTES_STORAGE_KEY = 'pyjamacode-notes';
const BOOKMARKS_STORAGE_KEY = 'pyjamacode-bookmarks';

let questions = [];
let activeQuestionId = null;
let submissions = {};
let notes = {};
let bookmarks = {};
let unsavedFiles = {};
let quizResults = {};

// Anonymous visitors can browse freely. Running code and gated content require
// an account, so those actions open the sign-in modal instead.
function requireAuth() {
  if (typeof isAuthenticated === 'function' && isAuthenticated()) return true;
  if (typeof openAuthModal === 'function') openAuthModal('signin');
  return false;
}

// A chapter can opt in to a few anonymous runs via `freeRuns = true` in its
// front matter. Each run — the editor's Check or a runnable snippet — counts,
// and once the limit is reached every further attempt opens the sign-in modal.
const FREE_RUNS_LIMIT = 3;

function freeRunsKey(id) {
  return 'pyjamacode-free-runs-' + id;
}

function freeRunsUsed(id) {
  try { return parseInt(localStorage.getItem(freeRunsKey(id)) || '0', 10) || 0; } catch (e) { return 0; }
}

function requireAuthForRun() {
  if (typeof isAuthenticated === 'function' && isAuthenticated()) return true;
  const q = questions.find((x) => x.id === activeQuestionId);
  if (q && q.free_runs === true) {
    const used = freeRunsUsed(activeQuestionId);
    if (used < FREE_RUNS_LIMIT) {
      try { localStorage.setItem(freeRunsKey(activeQuestionId), String(used + 1)); } catch (e) {}
      return true;
    }
  }
  if (typeof openAuthModal === 'function') openAuthModal('signin');
  return false;
}

function clearFreeRuns() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.indexOf('pyjamacode-free-runs-') === 0)
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

let codeMirror = null;
let notesCodeMirror = null;
let isSettingValue = false;
let isSettingNotesValue = false;
// True once the notes editor has been populated with the active chapter's saved
// notes. Guards the pre-switch save from clobbering notes with the empty editor
// on the initial load (before selectQuestion fills it).
let notesEditorPopulated = false;
let notesPreviewMode = true;
let activeFileIndex = 0;
let fileList = [];
let filePerProblem = {};
let notesSavedHeight = null;
let notesViewState = 'normal';
let notesWidget = null;
let treeExpanded = {};
let expandedGroup = null;
let _groupsInitialized = false;
let courseGroups = [];
var _dirtySubmissions = {};
var _dirtyNotes = {};
var _dirtyQuizzes = {};

// Persisted dirty IDs — survive page refresh for modal listing
function getDirtyIds() {
  try { return JSON.parse(localStorage.getItem('pyjamacode-dirty-ids') || '[]'); } catch (e) { return []; }
}

function addDirtyId(id) {
  var ids = getDirtyIds();
  if (ids.indexOf(id) === -1) ids.push(id);
  try { localStorage.setItem('pyjamacode-dirty-ids', JSON.stringify(ids)); } catch (e) {}
}

function clearDirtyIds() {
  try { localStorage.removeItem('pyjamacode-dirty-ids'); } catch (e) {}
}

function bumpLocalVersion() {
  try {
    var cur = localStorage.getItem('pyjamacode-local-version');
    var v = (cur ? parseInt(cur, 10) : 0) + 1;
    localStorage.setItem('pyjamacode-local-version', String(v));
  } catch (e) {}
}

function setSyncedVersion() {
  try {
    var lv = localStorage.getItem('pyjamacode-local-version');
    localStorage.setItem('pyjamacode-synced-version', lv || '0');
  } catch (e) {}
}

function hasDirtyData() {
  if (Object.keys(_dirtySubmissions).length > 0 || Object.keys(_dirtyNotes).length > 0 || Object.keys(_dirtyQuizzes).length > 0) return true;
  // Check persisted version mismatch (survives page refresh)
  try {
    return localStorage.getItem('pyjamacode-local-version') !== localStorage.getItem('pyjamacode-synced-version');
  } catch (e) { return false; }
}

function updateSyncIndicator() {
  var authed = typeof isAuthenticated === 'function' && isAuthenticated();
  var dot = document.getElementById('syncDot');

  // Update dropdown button
  var btn = document.getElementById('syncBtn');
  var el = document.getElementById('syncIndicator');
  var label = document.getElementById('syncLabel');

  // Update footer indicator
  var btnF = document.getElementById('syncBtnFooter');
  var elF = document.getElementById('syncIndicatorFooter');
  var labelF = document.getElementById('syncLabelFooter');

  if (!btn || !el || !label) return;

  if (!authed) {
    btn.classList.add('d-none');
    if (btnF) btnF.classList.add('d-none');
    if (dot) dot.style.display = 'none';
    return;
  }
  btn.classList.remove('d-none');
  if (btnF) btnF.classList.remove('d-none');
  if (dot) dot.style.display = '';

  var icon = el.querySelector('i');
  var iconF = elF ? elF.querySelector('i') : null;
  if (!icon) return;

  btn.className = 'sync-dropdown-item';
  if (btnF) btnF.className = 'sync-btn-footer';
  if (dot) dot.className = 'sync-dot';

  var stateClass, stateIcon, stateLabel, stateTitle;
  if (window._isPushingLocally) {
    stateClass = 'syncing';
    stateIcon = 'bi bi-arrow-repeat';
    stateLabel = 'Sync to cloud';
    stateTitle = 'Syncing...';
  } else if (hasDirtyData()) {
    stateClass = 'dirty';
    stateIcon = 'bi bi-cloud-arrow-up';
    stateLabel = 'Sync to cloud';
    stateTitle = 'Unsaved changes — click to sync';
  } else {
    stateClass = 'synced';
    stateIcon = 'bi bi-cloud-check';
    stateLabel = 'Synced to cloud';
    stateTitle = 'In sync';
  }

  icon.className = stateIcon;
  btn.classList.add(stateClass);
  btn.title = stateTitle;
  label.textContent = stateLabel;

  if (iconF) iconF.className = stateIcon;
  if (btnF) { btnF.classList.add(stateClass); btnF.title = stateTitle; }
  if (labelF) labelF.textContent = stateLabel;
  if (dot) dot.classList.add(stateClass);
}

// Click handler for sync button — show confirmation modal with unsaved changes
document.addEventListener('click', function(e) {
  var btn = e.target.closest('#syncBtn') || e.target.closest('#syncBtnFooter');
  if (!btn || btn.classList.contains('d-none') || !hasDirtyData() || window._isPushingLocally) return;
  var listEl = document.getElementById('syncChangesList');
  var dialog = document.getElementById('syncConfirmModal');
  var confirmBtn = document.getElementById('syncConfirmYes');
  if (!listEl || !dialog || !confirmBtn) return;
  // Read persisted dirty IDs (survives page refresh, covers all tabs)
  var dirtyIds = getDirtyIds();
  var seen = {};
  var items = [];
  dirtyIds.forEach(function(id) {
    if (seen[id]) return;
    seen[id] = true;
    var q = questions.find(function(q) { return q.id === id; });
    var title = q ? q.title : id;
    items.push('<div><span class="text-in-progress">\u2714</span> ' + escapeHtml(title) + '</div>');
  });
  listEl.innerHTML = items.length ? items.join('') : '<div class="text-muted">No unsaved changes</div>';
  dialog.showModal();
});

document.addEventListener('click', function(e) {
  if (e.target.id === 'syncConfirmYes' || e.target.closest('#syncConfirmYes')) {
    // Save current problem state first so dirty flags are up to date
    if (typeof saveCurrentCode === 'function' && activeQuestionId) saveCurrentCode();
    if (typeof saveCurrentNotes === 'function' && activeQuestionId) saveCurrentNotes();
    document.dispatchEvent(new CustomEvent('cloud-sync-requested'));
  }
});

function init() {
  // Ensure clean dirty state on every page load
  _dirtySubmissions = {};
  _dirtyNotes = {};
  _dirtyQuizzes = {};
  // Show session expired message if redirected here
  if (window.location.search.indexOf('session=expired') !== -1) {
    var msg = document.createElement('div');
    msg.className = 'alert alert-warning text-center m-0 rounded-0';
    msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Signed out — your account was accessed from another browser.';
    document.body.prepend(msg);
    setTimeout(function() { msg.remove(); }, 6000);
  }

  // Course groups (data/course_groups.yaml) — a course may belong to several
  const groupDataEl = document.getElementById('course-groups');
  if (groupDataEl) {
    try {
      const parsed = JSON.parse(groupDataEl.textContent);
      courseGroups = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      courseGroups = [];
    }
  }

  if (!problemDataEl || !activeProblemInput) {
    // Standalone pages (like the landing page) still need auth + sync UI.
    initFirebase();
    initTypedTitle();
    setupAuth();
    initSync();
    updateSyncIndicator();
    return;
  }

  // Dashboard page — skip full platform init but keep sidebar functional
  if (window.location.pathname === '/dashboard/' || window.location.pathname === '/dashboard') {
    try { questions = JSON.parse(problemDataEl.textContent) || []; } catch (e) { questions = []; }
    initFirebase();
    initTypedTitle();
    // Load local data for tree and dashboard progress
    loadSubmissions();
    try { var qr = localStorage.getItem('pyjamacode-quiz-results'); if (qr) quizResults = JSON.parse(qr) || {}; } catch (e) {}
    setupAuth();
    initSidebarToggle();
    initSidebarTabs();
    renderQuestionList();
    renderDashboard();
    updateSyncIndicator();
    // Live refresh: re-render dashboard when data changes (same-browser tabs)
    window.addEventListener('storage', function() {
      loadSubmissions();
      try { var qr2 = localStorage.getItem('pyjamacode-quiz-results'); if (qr2) quizResults = JSON.parse(qr2) || {}; } catch (e) {}
      renderQuestionList();
      renderDashboard();
    });
    // Periodic Firestore poll for cross-browser/device sync
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
      (function startPoll() {
        var pollTimer = setInterval(function() {
          var user = firebase.auth().currentUser;
          if (!user) return;
          var db = firebase.firestore();
          db.collection('users').doc(user.uid).collection('codes').get().then(function(snap) {
            var changed = false;
            snap.forEach(function(doc) {
              var data = doc.data();
              if (!submissions[doc.id]) submissions[doc.id] = {};
              if (data.code !== undefined && submissions[doc.id].code !== data.code) { submissions[doc.id].code = data.code; changed = true; }
              if (data.status && submissions[doc.id].status !== data.status) { submissions[doc.id].status = data.status; changed = true; }
            });
            if (changed) { persistSubmissions(); renderQuestionList(); renderDashboard(); }
          });
          db.collection('users').doc(user.uid).collection('quizzes').get().then(function(snap) {
            var changed = false;
            snap.forEach(function(doc) {
              var data = doc.data();
              if (data.results && JSON.stringify(quizResults[doc.id]) !== JSON.stringify(data.results)) {
                quizResults[doc.id] = data.results;
                changed = true;
              }
            });
            if (changed) {
              try { localStorage.setItem('pyjamacode-quiz-results', JSON.stringify(quizResults)); } catch (e) {}
              renderQuestionList(); renderDashboard();
            }
          });
        }, 30000);
      })();
    }
    return;
  }

  // Redirect authenticated users from landing page to dashboard
  if (window.location.pathname === '/' || window.location.pathname === '') {
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      window.location.replace('/dashboard/');
      return;
    }
  }

  try {
    questions = JSON.parse(problemDataEl.textContent);
    questions.forEach((q) => {
      if ((!q.quiz || !q.quiz.trim()) && q.quiz2) {
        const m = q.quiz2.match(/===QUIZ===\n([\s\S]*)$/) || q.quiz2.match(/<!--\s*quiz\s*-->([\s\S]*?)<!--\s*\/\s*quiz\s*-->/);
        if (m) q.quiz = m[1].trim();
      }
      delete q.quiz2;
    });
  } catch (e) {
    console.error('Failed to parse problem data:', e);
    questions = [];
  }

  activeQuestionId = activeProblemInput.value || (questions[0] && questions[0].id);

  // Detect course landing page — select the intro question and expand tree
  const courseMatch = window.location.pathname.match(/^\/courses\/([^\/]+)\/?$/);
  if (courseMatch) {
    const introQ = questions.find((q) => q.isIntro && q.topic === courseMatch[1]);
    if (introQ) {
      activeQuestionId = introQ.id;
      treeExpanded[courseMatch[1]] = true;
    }
    // Wire the next button to go to the first lesson
    const nextBtn = document.getElementById('nextProblemBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        const firstLesson = questions.find((q) => !q.isIntro && q.topic === courseMatch[1]);
        if (firstLesson) window.location.href = firstLesson.permalink;
      });
    }
  }

  loadSubmissions();
  loadNotes();
  loadBookmarks();
  try { const qr = localStorage.getItem('pyjamacode-quiz-results'); if (qr) quizResults = JSON.parse(qr) || {}; } catch (e) {}
  initCodeMirror();
  initNotesCodeMirror();
  if (!isAuthenticated()) expandFirstCourseForGuest();
  renderQuestionList();
  // Skip selectQuestion for intro questions (course landing page content is
  // already rendered server-side); enhance it in place instead.
  const _q = questions.find((q) => q.id === activeQuestionId);
  if (questionContentEl && (!_q || !_q.isIntro)) {
    selectQuestion(activeQuestionId);
  } else if (questionContentEl && _q && _q.isIntro) {
    enhanceImages(questionContentEl);
    initImageZoom(questionContentEl);
    const readingEl = document.getElementById('readingContent');
    if (readingEl) {
      enhanceImages(readingEl);
      initImageZoom(readingEl);
    }
  }
  setNotesPreviewMode(true);
  initTypedTitle();
  notesSavedHeight = (notesArea && notesArea.offsetHeight) || 320;
  // Start with notes minimized
  setTimeout(() => minimizeNotes(), 50);

  // Double-click notes header to toggle minimize/restore
  const notesHeader = notesArea ? notesArea.querySelector('.notes-header') : null;
  if (notesHeader) {
    notesHeader.addEventListener('dblclick', () => {
      if (notesViewState === 'minimized') restoreNotes();
      else minimizeNotes();
    });
  }

  if (questionSearchEl) {
    questionSearchEl.addEventListener('input', (e) => {
      const isBookmarks = document.getElementById('bookmarksList') && !document.getElementById('bookmarksList').classList.contains('d-none');
      if (isBookmarks) renderBookmarksList(e.target.value);
      else renderQuestionList(e.target.value);
    });
  }
  if (resetBtn) resetBtn.addEventListener('click', resetCase);
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllFiles);
  initSidebarToggle();
  initSidebarTabs();
  initBookmarkBtn();
  initProblemNav();
  if (clearConsoleBtn) clearConsoleBtn.addEventListener('click', () => { consoleOutputEl.textContent = ''; });
  // Logo/title link — update href based on auth state and save auto-resume
  // Logo/title link — route based on auth state
  const homeLink = document.getElementById('homeLink');
  if (homeLink) {
    function updateHomeHref() {
      homeLink.href = (typeof isAuthenticated === 'function' && isAuthenticated()) ? '/dashboard/' : '/';
    }
    updateHomeHref();
    if (typeof onAuthChange !== 'undefined') onAuthChange(updateHomeHref);
  }

  // Landing page: open the first course's introduction page.
  const landingStartBtn = document.getElementById('landingStartBtn');
  if (landingStartBtn) {
    landingStartBtn.addEventListener('click', () => {
      const topic = firstTopicKey();
      if (topic) window.location.href = '/courses/' + topic + '/';
    });
  }

  // Resume button in dropdown — navigate to last saved problem + tab
  function setupResumeLink(link) {
    if (!link) return;
    var saved = localStorage.getItem('lastProblemUrl');
    if (saved && saved.includes('/courses/')) {
      link.textContent = 'Resume';
      link.onclick = function(e) {
        e.preventDefault();
        var tab = localStorage.getItem('lastProblemTab');
        var url = saved;
        if (tab && tab !== 'challenge') url += (url.indexOf('?') === -1 ? '?' : '&') + 'tab=' + tab;
        window.location.href = url;
      };
    } else {
      link.textContent = 'Start Learning';
      link.onclick = function(e) {
        e.preventDefault();
        // Navigate to the first course landing page
        if (questions.length) {
          var topics = {};
          questions.forEach(function(q) {
            if (!q.isIntro && q.topic && !topics[q.topic]) topics[q.topic] = q.topic_weight || 99;
          });
          var sorted = Object.keys(topics).sort(function(a, b) { return (topics[a] || 99) - (topics[b] || 99); });
          if (sorted.length) window.location.href = '/courses/' + sorted[0] + '/';
          else window.location.href = '/dashboard/';
        } else {
          window.location.href = '/dashboard/';
        }
      };
    }
  }
  if (typeof resumeLink !== 'undefined') setupResumeLink(resumeLink);
  if (notesModeBtn) notesModeBtn.addEventListener('click', toggleNotesMode);
  if (exportNotesMenuItem) exportNotesMenuItem.addEventListener('click', (e) => { e.preventDefault(); exportNotes(); });
  if (exportPdfMenuItem) exportPdfMenuItem.addEventListener('click', (e) => { e.preventDefault(); exportNotesPdf(); });
  if (notesMinimizeBtn) notesMinimizeBtn.addEventListener('click', minimizeNotes);
  if (notesMaximizeBtn) notesMaximizeBtn.addEventListener('click', maximizeNotes);
  if (notesRestoreBtn) notesRestoreBtn.addEventListener('click', restoreNotes);
  const notesAuthPromptSignin = document.getElementById('notesAuthPromptSignin');
  const notesAuthPromptClose = document.getElementById('notesAuthPromptClose');
  if (notesAuthPromptSignin) notesAuthPromptSignin.addEventListener('click', () => {
    hideNotesAuthPrompt();
    if (typeof openAuthModal === 'function') openAuthModal('signin');
  });
  if (notesAuthPromptClose) notesAuthPromptClose.addEventListener('click', hideNotesAuthPrompt);
  if (notesPreviewEl) {
    notesPreviewEl.addEventListener('dblclick', (e) => {
      const rect = notesPreviewEl.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(notesPreviewEl).lineHeight) || 24;
      const paddingTop = parseFloat(getComputedStyle(notesPreviewEl).paddingTop) || 0;
      const relativeY = e.clientY - rect.top - paddingTop;
      const approximateLine = Math.max(0, Math.floor(relativeY / lineHeight));
      setNotesPreviewMode(false, approximateLine);
    });
  }

  document.addEventListener('keydown', handleKeyboardShortcuts);

  initResizers();
  initNotesFloat();
  initTooltips();
  initTabs();
  initFirebase();
  setupAuth();
  initSync();
  updateSyncIndicator();
}

function handleKeyboardShortcuts(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (activeQuestionId) {
      saveCurrentCode();
      saveCurrentNotes();
      hideAllUnsavedDots();
    }
  }
  if (e.key === 'Escape' && !notesPreviewMode) {
    e.preventDefault();
    setNotesPreviewMode(true);
  }
}

function initResizers() {
  if (resizerCasesCase && sidebarPane) {
    setupHorizontalResize(resizerCasesCase, sidebarPane, 'left');
  }
  if (resizerCaseWorkspace && questionPane) {
    setupHorizontalResize(resizerCaseWorkspace, questionPane, 'left');
  }
}

function initNotesResizer() {
  // Notes are a floating window now; the old grid resizer is unused.
}

function createDragOverlay(cursor) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:9999;cursor:${cursor};`;
  document.body.appendChild(overlay);
  return overlay;
}

function setupHorizontalResize(resizer, pane, side) {
  if (!resizer || !pane) return;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = pane.getBoundingClientRect().width;
    const minWidth = 180;
    const maxWidth = Math.max(minWidth, Math.floor(window.innerWidth * 0.45));
    const multiplier = side === 'left' ? 1 : -1;

    resizer.classList.add('resizing');
    document.body.style.userSelect = 'none';
    const overlay = createDragOverlay('col-resize');

    let refreshScheduled = false;
    const scheduleRefresh = () => {
      if (!refreshScheduled) {
        refreshScheduled = true;
        requestAnimationFrame(() => {
          refreshEditors();
          refreshScheduled = false;
        });
      }
    };

    const onMouseMove = (ev) => {
      const deltaX = ev.clientX - startX;
      const newWidth = startWidth + deltaX * multiplier;
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      pane.style.width = `${clampedWidth}px`;
      scheduleRefresh();
    };

    const onMouseUp = () => {
      overlay.remove();
      resizer.classList.remove('resizing');
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      refreshEditors();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function setupVerticalResize(resizer, pane, container, maxHeightFn = null, onResizeEnd = null) {
  if (!resizer || !pane || !container) return;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeight = pane.getBoundingClientRect().height;
    const minHeight = 80;
    const rawMaxHeight = maxHeightFn
      ? maxHeightFn()
      : container.getBoundingClientRect().height * 0.7;
    const maxHeight = Math.max(minHeight, Math.floor(rawMaxHeight));

    resizer.classList.add('resizing');
    document.body.style.userSelect = 'none';
    const overlay = createDragOverlay('row-resize');

    let refreshScheduled = false;
    const scheduleRefresh = () => {
      if (!refreshScheduled) {
        refreshScheduled = true;
        requestAnimationFrame(() => {
          refreshEditors();
          refreshScheduled = false;
        });
      }
    };

    const onMouseMove = (ev) => {
      const deltaY = ev.clientY - startY;
      const newHeight = startHeight - deltaY;
      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      pane.style.height = `${clampedHeight}px`;
      scheduleRefresh();
    };

    const onMouseUp = () => {
      overlay.remove();
      resizer.classList.remove('resizing');
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (onResizeEnd) onResizeEnd(pane.offsetHeight);
      refreshEditors();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function refreshEditors() {
  if (codeMirror) requestAnimationFrame(() => codeMirror.refresh());
  if (notesCodeMirror) requestAnimationFrame(() => notesCodeMirror.refresh());
}

function initTooltips() {
  if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach((el) => {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });
}

function updateTooltip(element, title) {
  if (!element) return;
  element.setAttribute('title', title);
  element.setAttribute('data-bs-original-title', title);
  if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
  const tooltip = bootstrap.Tooltip.getInstance(element);
  if (tooltip) {
    tooltip.setContent({ '.tooltip-inner': title });
  }
}

function initCodeMirror() {
  if (!codeEditorWrapper) return;

  if (typeof CodeMirror === 'undefined') {
    // Fallback to plain textarea if CodeMirror failed to load.
    codeEditorWrapper.style.display = 'none';
    if (codeEditorEl) codeEditorEl.style.display = 'block';
    return;
  }

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  const language = activeQuestion?.language || 'c';

  codeMirror = CodeMirror(codeEditorWrapper, {
    value: codeEditorEl ? codeEditorEl.value : '',
    mode: langToMode(language),
    theme: getCodeMirrorTheme(),
    lineNumbers: true,
    styleActiveLine: true,
    tabSize: 4,
    indentUnit: 4,
    lineWrapping: true,
    autofocus: false,
  });

  codeMirror.on('change', () => {
    if (codeEditorEl) {
      codeEditorEl.value = codeMirror.getValue();
    }
    if (!isSettingValue) {
      showFileUnsavedDot(activeFileIndex);
      // Debounced auto-save to localStorage (not cloud)
      if (window._codeSaveTimer) clearTimeout(window._codeSaveTimer);
      window._codeSaveTimer = setTimeout(function() {
        if (activeQuestionId) saveCurrentCode();
      }, 1500);
    }
  });
}

function getCodeMirrorTheme() {
  return 'github-dark';
}

function updateCodeMirrorMode(language) {
  if (!codeMirror) return;
  codeMirror.setOption('mode', langToMode(language));
}

function initNotesCodeMirror() {
  if (!notesEditorWrapper) return;

  if (typeof CodeMirror === 'undefined') {
    notesEditorWrapper.style.display = 'none';
    if (notesEditorEl) notesEditorEl.style.display = 'block';
    return;
  }

  notesCodeMirror = CodeMirror(notesEditorWrapper, {
    value: notesEditorEl ? notesEditorEl.value : '',
    mode: 'markdown',
    theme: getCodeMirrorTheme(),
    lineNumbers: true,
    styleActiveLine: true,
    tabSize: 4,
    indentUnit: 4,
    lineWrapping: true,
    autofocus: false,
  });

  notesCodeMirror.on('change', () => {
    if (notesEditorEl) {
      notesEditorEl.value = notesCodeMirror.getValue();
    }
    if (!isSettingNotesValue) {
      showNotesUnsavedDot();
      if (notesPreviewMode) {
        renderNotesPreview();
      }
      // Debounced auto-save; when the edit settles, persist locally and push
      // the finished edit to the cloud.
      if (window._notesSaveTimer) clearTimeout(window._notesSaveTimer);
      window._notesSaveTimer = setTimeout(function() {
        if (activeQuestionId && saveCurrentNotes()) syncNotesToCloud();
        if (!isAuthenticated()) showNotesAuthPrompt();
      }, 1500);
    }
  });

  notesCodeMirror.on('blur', function() {
    if (activeQuestionId && getNotesEditorValue() !== notes[activeQuestionId]) {
      if (saveCurrentNotes()) syncNotesToCloud();
    }
    if (!isAuthenticated()) showNotesAuthPrompt();
  });
}

function getNotesEditorValue() {
  return notesCodeMirror ? notesCodeMirror.getValue() : (notesEditorEl ? notesEditorEl.value : '');
}

function setNotesEditorValue(value) {
  isSettingNotesValue = true;
  if (notesCodeMirror) {
    notesCodeMirror.setValue(value);
  }
  if (notesEditorEl) {
    notesEditorEl.value = value;
  }
  isSettingNotesValue = false;
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      notes = JSON.parse(saved) || {};
    }
  } catch (e) {
    console.warn('Failed to load saved notes:', e);
    notes = {};
  }
}

function loadBookmarks() {
  try {
    const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (saved) {
      bookmarks = JSON.parse(saved) || {};
    }
  } catch (e) {
    bookmarks = {};
  }
}

function persistBookmarks() {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {}
}

function toggleBookmark(id) {
  if (!id) return;
  if (bookmarks[id]) {
    delete bookmarks[id];
  } else {
    bookmarks[id] = true;
  }
  persistBookmarks();
  updateBookmarkBtn(id);
  renderBookmarksList(questionSearchEl ? questionSearchEl.value : '');
}

function updateBookmarkBtn(id) {
  const icon = document.querySelector('#bookmarkBtn i');
  if (!icon) return;
  const isBookmarked = id && bookmarks[id];
  icon.className = isBookmarked ? 'bi bi-bookmark-fill' : 'bi bi-bookmark';
  if (bookmarkBtn) bookmarkBtn.classList.toggle('d-none', !id);
}

function renderBookmarksList(filter) {
  const el = document.getElementById('bookmarksList');
  if (!el) return;
  const ids = Object.keys(bookmarks);
  if (ids.length === 0) {
    el.innerHTML = '<div class="p-3 text-muted small">No bookmarked problems yet. Click the <i class="bi bi-bookmark"></i> icon on a problem to add it here.</div>';
    return;
  }
  const filterLower = (filter || '').toLowerCase();
  const matched = questions.filter((q) => ids.includes(q.id) && (!filterLower || q.title.toLowerCase().includes(filterLower)));
  if (matched.length === 0) {
    el.innerHTML = '<div class="p-3 text-muted small">No bookmarks match your search.</div>';
    return;
  }
  el.innerHTML = matched.map((q) => `
    <div class="tree-leaf" data-id="${q.id}">
      <div class="question-title">${(function(){var s=getLessonState(q.id);return q.isIntro?'':'<i class="bi '+(s==='completed'?'bi-check-circle-fill text-pass':s==='in-progress'?'bi-circle-half text-in-progress':'bi-circle text-muted')+' me-1"></i>'})()}${escapeHtml(q.title)}</div>
      <div class="question-meta">${q.isIntro ? 'Course Overview' : ('<span class="diff-pill diff-' + (q.difficulty||'medium') + '">' + (q.difficulty||'medium') + '</span> <span class="leaf-status">' + (submissions[q.id]?.status || 'Unattempted') + '</span>')}</div>
    </div>
  `).join('');
  el.querySelectorAll('.tree-leaf').forEach((item) => {
    item.addEventListener('click', () => {
      selectQuestion(item.dataset.id);
    });
  });
}

function initSidebarTabs() {
  const tabLessons = document.getElementById('tabLessons');
  const tabBookmarks = document.getElementById('tabBookmarks');
  const questionList = document.getElementById('questionList');
  const bookmarksList = document.getElementById('bookmarksList');
  if (!tabLessons || !tabBookmarks || !questionList || !bookmarksList) return;

  function setSidebarTab(tab) {
    const isBookmarks = tab === 'bookmarks';
    tabLessons.classList.toggle('active', !isBookmarks);
    tabBookmarks.classList.toggle('active', isBookmarks);
    questionList.classList.toggle('d-none', isBookmarks);
    bookmarksList.classList.toggle('d-none', !isBookmarks);
    if (isBookmarks) renderBookmarksList(questionSearchEl ? questionSearchEl.value : '');
    else renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
  }

  tabLessons.addEventListener('click', () => setSidebarTab('lessons'));
  tabBookmarks.addEventListener('click', () => setSidebarTab('bookmarks'));
}

function initBookmarkBtn() {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    toggleBookmark(activeQuestionId);
  });
}

function persistNotes() {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.warn('Failed to save notes:', e);
  }
}

// Guests can take notes locally, but we nudge them to sign in so the notes get
// saved online. Local notes are always kept — this is only a prompt.
function showNotesAuthPrompt() {
  if (typeof isAuthenticated === 'function' && isAuthenticated()) return;
  const el = document.getElementById('notesAuthPrompt');
  if (el) el.classList.add('show');
}

function hideNotesAuthPrompt() {
  const el = document.getElementById('notesAuthPrompt');
  if (el) el.classList.remove('show');
}

function saveCurrentNotes() {
  if (!activeQuestionId) return false;
  var val = getNotesEditorValue();
  if ((notes[activeQuestionId] || '') === (val || '')) {
    hideNotesUnsavedDot();
    return false;
  }
  notes[activeQuestionId] = val;
  hideNotesUnsavedDot();
  _dirtyNotes[activeQuestionId] = true;
  addDirtyId(activeQuestionId);
  bumpLocalVersion();
  updateSyncIndicator();
  persistNotes();
  return true;
}

// Push a finished edit to the cloud. `cloud-sync-requested` is handled by the
// sync module (initSync -> doSync), which only fires when the user is signed in.
function syncNotesToCloud() {
  document.dispatchEvent(new CustomEvent('cloud-sync-requested'));
}

function setNotesPreviewMode(preview, approximateLine = null) {
  notesPreviewMode = preview;
  if (notesPreviewMode) {
    // Exiting edit mode: persist locally and push the finished edit to the cloud.
    if (saveCurrentNotes()) syncNotesToCloud();
    renderNotesPreview();
    if (notesEditorWrapper) notesEditorWrapper.classList.add('d-none');
    if (notesEditorEl) notesEditorEl.style.display = 'none';
    if (notesPreviewEl) notesPreviewEl.classList.remove('d-none');
    if (notesModeBtn) notesModeBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
    updateTooltip(notesModeBtn, 'Edit notes');
  } else {
    if (notesEditorWrapper) notesEditorWrapper.classList.remove('d-none');
    if (notesEditorEl) notesEditorEl.style.display = 'none';
    if (notesPreviewEl) notesPreviewEl.classList.add('d-none');
    if (notesModeBtn) notesModeBtn.innerHTML = '<i class="bi bi-eye"></i>';
    updateTooltip(notesModeBtn, 'Preview rendered notes');
    if (notesCodeMirror) {
      requestAnimationFrame(() => {
        notesCodeMirror.refresh();
        if (approximateLine !== null) {
          const doc = notesCodeMirror.getDoc();
          const lastLine = doc.lastLine();
          doc.setCursor(Math.min(approximateLine, lastLine), 0);
          notesCodeMirror.focus();
        }
      });
    }
  }
}

function toggleNotesMode() {
  setNotesPreviewMode(!notesPreviewMode);
}


// Floating notes window: drag by its header, resize by corner, persist state,
// and collapse to a small widget when minimized.
const NOTES_FLOAT_KEY = 'pyjamacode-notes-float';

function saveNotesFloat() {
  if (!notesArea) return;
  try {
    const r = notesArea.getBoundingClientRect();
    localStorage.setItem(NOTES_FLOAT_KEY, JSON.stringify({
      left: Math.round(r.left), top: Math.round(r.top),
      width: Math.round(r.width), height: Math.round(r.height),
    }));
  } catch (e) {}
}

function applyNotesFloat(saved) {
  if (!notesArea) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const dflt = { left: 40, top: vh - 320 - 24, width: 520, height: 320 };
  const pos = saved || dflt;
  const width = Math.max(280, Math.min(pos.width || dflt.width, vw - 16));
  const height = Math.max(160, Math.min(pos.height || dflt.height, vh - 16));
  const left = Math.max(0, Math.min(pos.left != null ? pos.left : dflt.left, vw - width - 8));
  const top = Math.max(0, Math.min(pos.top != null ? pos.top : dflt.top, vh - height - 8));
  notesArea.style.left = left + 'px';
  notesArea.style.top = top + 'px';
  notesArea.style.width = width + 'px';
  notesArea.style.height = height + 'px';
}

function openNotes() {
  notesViewState = 'normal';
  if (questionPaneBody) questionPaneBody.classList.remove('notes-maximized');
  if (notesArea) notesArea.classList.remove('notes-hidden', 'notes-maximized');
  updateNotesViewButtons();
  // Persist any in-progress edits, then reload notes from local storage so
  // external updates (e.g. the cloud pull after sign-in) are visible here.
  if (activeQuestionId && typeof saveCurrentNotes === 'function') saveCurrentNotes();
  loadNotes();
  if (activeQuestionId) {
    setNotesEditorValue(notes[activeQuestionId] || '');
  }
  if (notesPreviewMode) renderNotesPreview();
  if (notesArea) notesArea.style.height = notesSavedHeight ? notesSavedHeight + 'px' : '';
  refreshEditors();
  if (codeMirror) setTimeout(() => { const ta = document.querySelector('#notesEditorWrapper .CodeMirror'); if (ta) ta.CodeMirror && ta.CodeMirror.focus(); }, 50);
}

function initNotesFloat() {
  if (!notesArea) return;
  notesWidget = document.getElementById('notesWidget');

  // Restore last position/size.
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(NOTES_FLOAT_KEY) || 'null'); } catch (e) {}
  applyNotesFloat(saved);

  // Drag by the header (not when a header button is clicked).
  const header = notesArea.querySelector('.notes-header');
  if (header) {
    let drag = null;
    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.target.closest('.dropdown')) return;
      if (notesArea.classList.contains('notes-maximized')) return;
      const r = notesArea.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
      header.setPointerCapture(e.pointerId);
    });
    header.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = notesArea.getBoundingClientRect();
      let left = drag.left + (e.clientX - drag.x);
      let top = drag.top + (e.clientY - drag.y);
      left = Math.max(0, Math.min(left, window.innerWidth - Math.min(r.width, 280)));
      top = Math.max(0, Math.min(top, window.innerHeight - Math.min(r.height, 80)));
      notesArea.style.left = left + 'px';
      notesArea.style.top = top + 'px';
    });
    const stopDrag = () => { if (drag) { drag = null; saveNotesFloat(); } };
    header.addEventListener('pointerup', stopDrag);
    header.addEventListener('pointercancel', stopDrag);
  }

  // Persist size changes (CSS resize:both) as well as drags.
  window.addEventListener('mouseup', () => { if (notesViewState === 'normal') saveNotesFloat(); });
  window.addEventListener('resize', () => { if (notesArea && !notesArea.classList.contains('notes-maximized')) applyNotesFloat(saved); });

  // Widget is always visible; click toggles the notes window.
  if (notesWidget) {
    notesWidget.addEventListener('click', () => {
      const hidden = notesArea && (notesArea.classList.contains('notes-hidden') || notesViewState === 'minimized');
      if (hidden) openNotes();
      else minimizeNotes();
    });
  }

  // Four-direction edge/corner resizing.
  initNotesResize();
}

const NOTES_MIN_W = 280;
const NOTES_MIN_H = 160;

// Attaches pointer-based resizing handles to the floating notes window so it
// can be resized from any edge or corner, like a native window.
function initNotesResize() {
  if (!notesArea) return;
  const dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  dirs.forEach((dir) => {
    const h = document.createElement('div');
    h.className = 'notes-resize-handle ' + dir + '-resize';
    notesArea.appendChild(h);
    h.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (notesArea.classList.contains('notes-maximized')) return;
      const r = notesArea.getBoundingClientRect();
      const start = {
        x: e.clientX, y: e.clientY,
        left: r.left, top: r.top, width: r.width, height: r.height,
      };
      h.setPointerCapture(e.pointerId);
      const onMove = (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        let left = start.left, top = start.top, width = start.width, height = start.height;
        if (dir.includes('e')) width = start.width + dx;
        if (dir.includes('s')) height = start.height + dy;
        if (dir.includes('w')) { width = start.width - dx; left = start.left + dx; }
        if (dir.includes('n')) { height = start.height - dy; top = start.top + dy; }
        // Clamp minimums and keep the window inside the viewport.
        width = Math.max(NOTES_MIN_W, width);
        height = Math.max(NOTES_MIN_H, height);
        if (dir.includes('w')) left = Math.min(start.left + start.width - NOTES_MIN_W, left);
        if (dir.includes('n')) top = Math.min(start.top + start.height - NOTES_MIN_H, top);
        left = Math.max(0, Math.min(left, window.innerWidth - NOTES_MIN_W));
        top = Math.max(0, Math.min(top, window.innerHeight - NOTES_MIN_H));
        width = Math.min(width, window.innerWidth - left);
        height = Math.min(height, window.innerHeight - top);
        notesArea.style.left = Math.round(left) + 'px';
        notesArea.style.top = Math.round(top) + 'px';
        notesArea.style.width = Math.round(width) + 'px';
        notesArea.style.height = Math.round(height) + 'px';
      };
      const onUp = () => {
        h.removeEventListener('pointermove', onMove);
        h.removeEventListener('pointerup', onUp);
        h.removeEventListener('pointercancel', onUp);
        saveNotesFloat();
      };
      h.addEventListener('pointermove', onMove);
      h.addEventListener('pointerup', onUp);
      h.addEventListener('pointercancel', onUp);
    });
  });
}

function minimizeNotes() {
  hideTooltip(notesMinimizeBtn);
  if (notesViewState === 'normal' && notesArea && notesArea.offsetHeight) {
    notesSavedHeight = notesArea.offsetHeight;
  }
  notesViewState = 'minimized';
  if (questionPaneBody) questionPaneBody.classList.remove('notes-maximized');
  if (notesArea) notesArea.classList.add('notes-hidden', 'notes-maximized');
  updateNotesViewButtons();
  refreshEditors();
}

function maximizeNotes() {
  hideTooltip(notesMaximizeBtn);
  if (notesViewState === 'normal' && notesArea && notesArea.offsetHeight) {
    notesSavedHeight = notesArea.offsetHeight;
  }
  notesViewState = 'maximized';
  if (questionPaneBody) questionPaneBody.classList.remove('notes-maximized');
  if (notesArea) notesArea.classList.add('notes-maximized');
  if (notesArea) notesArea.classList.remove('notes-hidden');
  updateNotesViewButtons();
  refreshEditors();
}

function restoreNotes() {
  hideTooltip(notesRestoreBtn);
  notesViewState = 'normal';
  if (questionPaneBody) questionPaneBody.classList.remove('notes-maximized');
  if (notesArea) {
    notesArea.classList.remove('notes-hidden', 'notes-maximized');
  }
  updateNotesViewButtons();
  refreshEditors();
}

function updateNotesViewButtons() {
  if (notesMinimizeBtn) {
    notesMinimizeBtn.classList.toggle('d-none', notesViewState === 'minimized');
    notesMinimizeBtn.style.order = notesViewState === 'minimized' ? '3' : '1';
  }
  if (notesMaximizeBtn) {
    notesMaximizeBtn.classList.toggle('d-none', notesViewState === 'maximized');
    notesMaximizeBtn.style.order = notesViewState === 'maximized' ? '3' : '2';
  }
  if (notesRestoreBtn) {
    notesRestoreBtn.classList.toggle('d-none', notesViewState === 'normal');
    notesRestoreBtn.style.order = notesViewState === 'minimized' ? '1' : notesViewState === 'maximized' ? '2' : '3';
  }
}

function hideTooltip(element) {
  if (!element || typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
  const tooltip = bootstrap.Tooltip.getInstance(element);
  if (tooltip) tooltip.hide();
}

// Turn every heading into a shareable anchor: assign a stable id and append a
// "#" link that jumps to the section and copies the full URL to the clipboard.
function slugifyHeading(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/gi, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function initHeadingLinks(root) {
  if (!root) return;
  const used = {};
  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    let id = h.getAttribute('id') || slugifyHeading(h.textContent);
    if (used[id] !== undefined) {
      used[id] += 1;
      id = id + '-' + used[id];
    } else {
      used[id] = 0;
    }
    h.setAttribute('id', id);
    h.classList.add('heading-anchored');

    const link = document.createElement('a');
    link.className = 'heading-anchor';
    link.href = '#' + id;
    link.setAttribute('aria-label', 'Link to this section');
    link.innerHTML = '<i class="bi bi-link-45deg"></i>';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = window.location.href.split('#')[0] + '#' + id;
      try { history.replaceState(null, '', window.location.pathname + window.location.search + '#' + id); } catch (err) {}
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      showHeadingLinkFeedback(link);
    });
    h.appendChild(link);
  });
}

function showHeadingLinkFeedback(link) {
  if (!link) return;
  link.classList.add('copied');
  if (link._copiedTimer) clearTimeout(link._copiedTimer);
  link._copiedTimer = setTimeout(() => link.classList.remove('copied'), 1200);
}

function renderNotesPreview() {
  if (!notesPreviewEl) return;
  const markdown = getNotesEditorValue() || '*No notes yet.*';
  let html = '';
  if (typeof marked !== 'undefined') {
    try {
      html = marked.parse(markdown, { breaks: true, gfm: true });
    } catch (e) {
      html = escapeHtml(markdown);
    }
  } else {
    html = escapeHtml(markdown);
  }
  notesPreviewEl.innerHTML = html;
  // Make code blocks look like the reading/lecture ones: titlebar + copy button.
  enhanceCodeBlocks(notesPreviewEl, { skipCaption: true });
  initHeadingLinks(notesPreviewEl);
}

function exportNotes() {
  if (!activeQuestionId) return;
  const question = questions.find((q) => q.id === activeQuestionId);
  const title = question ? question.title : activeQuestionId;
  const content = getNotesEditorValue() || '';
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = title.replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'notes';
  a.download = `${safeTitle}-notes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// Single-click PDF export of the notes. Renders the markdown with a light,
// print-friendly theme, rasterizes with html2canvas, and saves a multi-page
// A4 PDF via jsPDF.
function exportNotesPdf() {
  if (!activeQuestionId) return;
  const question = questions.find((q) => q.id === activeQuestionId);
  const title = question ? question.title : activeQuestionId;
  const safeTitle = title.replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'notes';

  if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
    exportNotes();
    return;
  }

  const markdown = getNotesEditorValue() || '';
  let html = '';
  if (typeof marked !== 'undefined') {
    try { html = marked.parse(markdown, { breaks: true, gfm: true }); }
    catch (e) { html = escapeHtml(markdown); }
  } else {
    html = escapeHtml(markdown);
  }
  if (!html) html = '<p>No notes yet.</p>';

  // Read the PDF export palette (always defined on :root) so the export is
  // rendered light and print-friendly regardless of the app's dark theme.
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim();
  const pdfVars = {
    '--bs-body-bg': v('--pdf-canvas-default') || '#ffffff',
    '--bs-body-color': v('--pdf-fg-default') || '#1f2328',
    '--bs-secondary-bg': v('--pdf-canvas-subtle') || '#f6f8fa',
    '--bs-secondary-color': v('--pdf-fg-muted') || '#656d76',
    '--bs-border-color': v('--pdf-border-default') || '#d0d7de',
    '--bs-primary': v('--pdf-accent') || '#0969da',
    '--bs-success': v('--pdf-success') || '#1a7f37',
    '--bs-warning': v('--pdf-warning') || '#9a6700',
    '--bs-danger': v('--pdf-danger') || '#cf222e',
    '--editor-bg': v('--pdf-code-bg') || '#f6f8fa',
    '--editor-fg': v('--pdf-fg-default') || '#1f2328',
    '--code-bg': v('--pdf-code-bg') || '#f6f8fa',
    '--border-color': v('--pdf-border-default') || '#d0d7de',
    '--accent-color': v('--pdf-accent') || '#0969da',
    '--accent-hover': v('--pdf-accent-hover') || '#0550ae',
    '--success-color': v('--pdf-success') || '#1a7f37',
    '--success-hover': v('--pdf-success-hover') || '#136c2e',
    '--warning-color': v('--pdf-warning') || '#9a6700',
    '--danger-color': v('--pdf-danger') || '#cf222e',
    '--btn-default-bg': v('--pdf-btn-default-bg') || '#f6f8fa',
    '--btn-default-border': v('--pdf-btn-default-border') || 'rgba(31,35,40,0.15)',
    '--btn-default-hover': v('--pdf-btn-default-hover') || '#f3f4f6',
    '--active-item-bg': 'rgba(9, 105, 218, 0.1)',
  };

  const container = document.createElement('div');
  container.className = 'pdf-export-container question-content';
  container.id = 'pdfExportContainer';
  // Scope the PDF palette to this container.
  let vars = '';
  for (const k in pdfVars) vars += k + ':' + pdfVars[k] + ';';
  container.style.cssText += vars;
  container.innerHTML = html;
  enhanceCodeBlocks(container, { skipCaption: true });
  // Scoped github-light hljs colors for code tokens.
  const hljsLight = document.createElement('style');
  hljsLight.textContent =
    '.pdf-export-container .hljs{color:#1f2328;background:#ffffff}' +
    '.pdf-export-container .hljs-comment,.pdf-export-container .hljs-quote{color:#6e7781;font-style:italic}' +
    '.pdf-export-container .hljs-keyword,.pdf-export-container .hljs-selector-tag,.pdf-export-container .hljs-literal,.pdf-export-container .hljs-section,.pdf-export-container .hljs-link{color:#cf222e}' +
    '.pdf-export-container .hljs-string,.pdf-export-container .hljs-regexp,.pdf-export-container .hljs-addition,.pdf-export-container .hljs-symbol,.pdf-export-container .hljs-bullet,.pdf-export-container .hljs-meta{color:#0a3069}' +
    '.pdf-export-container .hljs-number,.pdf-export-container .hljs-title,.pdf-export-container .hljs-attr,.pdf-export-container .hljs-attribute,.pdf-export-container .hljs-built_in,.pdf-export-container .hljs-doctag{color:#0550ae}' +
    '.pdf-export-container .hljs-name,.pdf-export-container .hljs-type,.pdf-export-container .hljs-selector-id,.pdf-export-container .hljs-selector-class,.pdf-export-container .hljs-template-variable,.pdf-export-container .hljs-variable{color:#953800}' +
    '.pdf-export-container .hljs-deletion,.pdf-export-container .hljs-selector-attr,.pdf-export-container .hljs-selector-pseudo{color:#82071e}';
  container.appendChild(hljsLight);

  document.body.appendChild(container);

  if (exportPdfMenuItem) exportPdfMenuItem.disabled = true;
  // Give fonts + hljs time to apply.
  setTimeout(async () => {
    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 36; // 0.5 inch top/bottom margin (unit is pt)
      const pageContentH = pageH - 2 * margin;
      // Crop the canvas into per-page slices of exactly `pageContentH` so pages
      // advance without overlap (shifting the whole image by pageContentH while
      // the first page starts at the margin duplicates the page tails).
      const pxPerPt = canvas.width / pageW;
      const sliceHpx = pageContentH * pxPerPt;
      let offsetPx = 0;
      let first = true;
      while (offsetPx < canvas.height) {
        const hpx = Math.min(sliceHpx, canvas.height - offsetPx);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.round(hpx);
        slice.getContext('2d').drawImage(canvas, 0, offsetPx, canvas.width, hpx, 0, 0, canvas.width, hpx);
        if (!first) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, margin, pageW, hpx / pxPerPt);
        first = false;
        offsetPx += hpx;
      }
      pdf.save(safeTitle + '-notes.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      exportNotes();
    } finally {
      if (exportPdfMenuItem) exportPdfMenuItem.disabled = false;
      container.remove();
    }
  }, 150);
}

function getEditorValue() {
  return codeMirror ? codeMirror.getValue() : (codeEditorEl ? codeEditorEl.value : '');
}

function setEditorValue(value) {
  isSettingValue = true;
  if (codeMirror) {
    codeMirror.setValue(value);
  }
  if (codeEditorEl) {
    codeEditorEl.value = value;
  }
  isSettingValue = false;
}

function buildQuestionTree() {
  const tree = {};
  questions.forEach((q) => {
    if (q.isIntro || q.hidden) return;
    const topic = q.topic || '';
    const subtopic = q.subtopic || '';
    if (!tree[topic]) tree[topic] = {};
    if (!tree[topic][subtopic]) tree[topic][subtopic] = [];
    tree[topic][subtopic].push(q);
  });
  return tree;
}

// Cache for quiz question counts per lesson
var _quizCountCache = {};

function getLessonState(id) {
  var q = questions.find(function(q) { return q.id === id; });
  if (!q) return 'unattempted';
  var codeStatus = submissions[id]?.status || '';
  var codeAccepted = codeStatus === 'Accepted';
  var codeInProgress = codeStatus && codeStatus !== 'Unattempted';
  var correctCount = quizResults[id] ? Object.keys(quizResults[id]).length : 0;
  var totalQuiz = 0;
  if (q.quiz && q.quiz.trim()) {
    if (_quizCountCache[id] === undefined) {
      // Parse quiz to count real questions (trimmed blocks that look like questions)
      var blocks = q.quiz.split(/\n##\s*/).filter(function(b) { return b.trim().length > 0; });
      // Exclude the lead-in block (just whitespace before first ##)
      _quizCountCache[id] = blocks.length;
    }
    totalQuiz = _quizCountCache[id];
  }
  // All correct
  if (codeAccepted && (totalQuiz === 0 || correctCount >= totalQuiz)) return 'completed';
  // Code accepted but quiz not fully correct
  if (codeAccepted && totalQuiz > 0 && correctCount < totalQuiz) return 'in-progress';
  // Any quiz progress
  if (correctCount > 0) return 'in-progress';
  // Code in progress (no quiz progress)
  if (codeInProgress) return 'in-progress';
  return 'unattempted';
}

function toggleTopic(topic) {
  treeExpanded[topic] = !treeExpanded[topic];
  renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
}

function toggleSubtopic(topic, subtopic) {
  const key = topic + '/' + subtopic;
  treeExpanded[key] = !treeExpanded[key];
  renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
}

function renderDashboard() {
  var contentEl = document.getElementById('dashboardContent');
  if (!contentEl || !questions.length) return;

  // Load local data for progress computation
  var subs = {};
  try { subs = JSON.parse(localStorage.getItem('pyjamacode-submissions') || '{}'); } catch (e) {}
  var quizRes = {};
  try { quizRes = JSON.parse(localStorage.getItem('pyjamacode-quiz-results') || '{}'); } catch (e) {}

  function localLessonState(id) {
    var q = questions.find(function(q) { return q.id === id; });
    if (!q) return 'unattempted';
    var codeStatus = subs[id]?.status || '';
    var codeAccepted = codeStatus === 'Accepted';
    var codeInProgress = codeStatus && codeStatus !== 'Unattempted';
    var correctCount = quizRes[id] ? Object.keys(quizRes[id]).length : 0;
    var totalQuiz = 0;
    if (q.quiz && q.quiz.trim()) {
      var blocks = q.quiz.split(/\n##\s*/).filter(function(b) { return b.trim().length > 0; });
      totalQuiz = blocks.length;
    }
    if (codeAccepted && (totalQuiz === 0 || correctCount >= totalQuiz)) return 'completed';
    if (codeAccepted && totalQuiz > 0 && correctCount < totalQuiz) return 'in-progress';
    if (correctCount > 0) return 'in-progress';
    if (codeInProgress) return 'in-progress';
    return 'unattempted';
  }

  var topics = {};
  questions.forEach(function(q) {
    if (q.isIntro || !q.topic) return;
    if (!topics[q.topic]) topics[q.topic] = { lessons: [], topicWeight: q.topic_weight || 99 };
    topics[q.topic].lessons.push(q);
  });

  var sortedTopics = Object.keys(topics).sort(function(a, b) {
    return (topics[a].topicWeight || 99) - (topics[b].topicWeight || 99);
  });

  function firstLesson(lessonList) {
    lessonList.sort(function(a, b) { return (a.weight || 99) - (b.weight || 99); });
    return lessonList[0];
  }

  function resumeLesson(lessonList) {
    lessonList.sort(function(a, b) { return (a.weight || 99) - (b.weight || 99); });
    for (var i = 0; i < lessonList.length; i++) {
      var s = subs[lessonList[i].id];
      if (!s || !s.status || s.status === 'Unattempted') return lessonList[i];
    }
    return null;
  }

  // Load course metadata (description, og_image from _index.md)
  var courseMeta = {};
  try { courseMeta = JSON.parse(document.getElementById('course-meta').textContent || '{}'); } catch (e) {}

  var html = '<div class="dashboard-courses">';
  sortedTopics.forEach(function(topic) {
    var info = topics[topic];
    var lessonList = info.lessons;
    lessonList.sort(function(a, b) { return (a.weight || 99) - (b.weight || 99); });
    var topicTitle = topic;
    if (lessonList[0] && lessonList[0].topic_title) topicTitle = lessonList[0].topic_title;

    var meta = courseMeta[topic] || {};
    var topicDesc = meta.description || '';
    var topicImage = meta.og_image || '';

    var total = lessonList.length;
    var completed = 0;
    var inProgress = 0;
    lessonList.forEach(function(q) {
      var st = localLessonState(q.id);
      if (st === 'completed') completed++;
      else if (st === 'in-progress') inProgress++;
    });
    var pct = total ? Math.round((completed / total) * 100) : 0;

    var resumeUrl = '/courses/' + topic + '/';
    if (pct > 0 && pct < 100) {
      var resume = resumeLesson(lessonList);
      if (resume) resumeUrl = resume.permalink;
    }

    html += '<div class="course-card">' +
      (topicImage ? '<img src="' + escapeHtml(topicImage) + '" alt="" class="course-card-img" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
      '<div class="course-card-body">' +
        '<h4 class="course-card-title">' + escapeHtml(topicTitle) + '</h4>' +
        (topicDesc ? '<p class="course-card-desc">' + escapeHtml(topicDesc) + '</p>' : '') +
        '<div class="progress mb-2" style="height:6px">' +
          '<div class="progress-bar" role="progressbar" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div class="course-card-footer">' +
          '<span class="course-card-stat">' + completed + '/' + total + (pct === 100 ? ' <span class="text-pass fw-semibold">Complete</span>' : inProgress > 0 ? ' <span class="text-in-progress">' + inProgress + ' active</span>' : '') + '</span>';
    if (resumeUrl) {
      var btnLabel = pct >= 100 ? 'Start Again' : (pct > 0 ? 'Resume' : 'Start');
      html += '<a href="' + resumeUrl + '" class="btn btn-sm btn-outline-primary">' + btnLabel + '</a>';
    }
    html += '</div></div></div>';
  });
  html += '</div>';

  var existing = contentEl.querySelector('.dashboard-courses');
  if (existing) existing.remove();
  var p = contentEl.querySelector('p');
  if (p) p.insertAdjacentHTML('afterend', html);
  else contentEl.insertAdjacentHTML('beforeend', html);
}

function getWeight(q, key, fallback) {
  const v = q[key];
  return (v !== undefined && v !== null) ? v : fallback;
}

// All groups a topic belongs to (a course may be in several), in definition order
function groupsForTopic(topic) {
  const out = [];
  courseGroups.forEach((g) => {
    if (!g || !g.title || !g.courses) return;
    if (g.courses.indexOf(topic) !== -1) {
      out.push({ title: g.title, weight: (g.weight !== undefined && g.weight !== null) ? g.weight : 99 });
    }
  });
  return out;
}

// The first course (topic) as it appears in the sidebar: ungrouped topics come
// first (by topic_weight), then grouped ones (by group weight, then topic_weight).
function firstTopicKey() {
  const tree = buildQuestionTree();
  const topicWeight = {};
  questions.forEach((q) => {
    const t = q.topic || '';
    const tw = getWeight(q, 'topic_weight', 99);
    if (topicWeight[t] === undefined || tw < topicWeight[t]) topicWeight[t] = tw;
  });
  const byWeight = (a, b) => (topicWeight[a] ?? 99) - (topicWeight[b] ?? 99);

  const groupWeight = {};
  const definedGroups = [];
  courseGroups.forEach((g) => {
    if (!g || !g.title) return;
    if (!(g.title in groupWeight)) definedGroups.push(g.title);
    if (g.weight === undefined || g.weight === null || groupWeight[g.title] === undefined) {
      groupWeight[g.title] = (g.weight !== undefined && g.weight !== null) ? g.weight : 99;
    }
  });
  const groupOrder = definedGroups.slice().sort((a, b) => (groupWeight[a] ?? 99) - (groupWeight[b] ?? 99));

  const groupsMap = {};
  const ungrouped = [];
  Object.keys(tree).forEach((topic) => {
    const gs = groupsForTopic(topic);
    if (gs.length === 0) { ungrouped.push(topic); return; }
    gs.forEach(({ title }) => {
      if (!groupsMap[title]) groupsMap[title] = [];
      if (groupsMap[title].indexOf(topic) === -1) groupsMap[title].push(topic);
    });
  });
  ungrouped.sort(byWeight);
  if (ungrouped.length) return ungrouped[0];
  for (const g of groupOrder) {
    if (groupsMap[g] && groupsMap[g].length) return groupsMap[g].slice().sort(byWeight)[0];
  }
  const topics = Object.keys(tree);
  return topics.length ? topics[0] : null;
}

// Guests get the first course expanded (its topic and all its subtopics) so its
// lessons are visible without any clicks.
function expandFirstCourseForGuest() {
  if (typeof isAuthenticated === 'function' && isAuthenticated()) return;
  const topic = firstTopicKey();
  if (!topic) return;
  treeExpanded[topic] = true;
  const subs = {};
  questions.forEach((q) => { if (q.topic === topic && q.subtopic) subs[q.subtopic] = true; });
  Object.keys(subs).forEach((s) => { treeExpanded[topic + '/' + s] = true; });
  const gs = groupsForTopic(topic);
  if (gs.length) { expandedGroup = gs[0].title; _groupsInitialized = true; }
}

function renderQuestionList(filter = '') {
  questionListEl.innerHTML = '';

  const tree = buildQuestionTree();
  const filterLower = filter.toLowerCase();

  // Compute min weight for each topic and subtopic
  const topicWeight = {};
  const subtopicWeight = {};
  questions.forEach((q) => {
    const t = q.topic || '';
    const st = q.subtopic || '';
    const tw = getWeight(q, 'topic_weight', 99);
    const sw = getWeight(q, 'subtopic_weight', 99);
    if (topicWeight[t] === undefined || tw < topicWeight[t]) topicWeight[t] = tw;
    const sk = t + '/' + st;
    if (subtopicWeight[sk] === undefined || sw < subtopicWeight[sk]) subtopicWeight[sk] = sw;
  });

  const sortTopics = (a, b) => (topicWeight[a] ?? 99) - (topicWeight[b] ?? 99);

  // Organize topics into groups (from data/course_groups.yaml).
  // A course may belong to multiple groups and is listed under each.
  const groupWeight = {};
  const definedGroups = [];
  courseGroups.forEach((g) => {
    if (!g || !g.title) return;
    if (!(g.title in groupWeight)) definedGroups.push(g.title);
    if (g.weight === undefined || g.weight === null || groupWeight[g.title] === undefined) {
      groupWeight[g.title] = (g.weight !== undefined && g.weight !== null) ? g.weight : 99;
    }
  });
  const groupOrder = definedGroups
    .slice()
    .sort((a, b) => (groupWeight[a] ?? 99) - (groupWeight[b] ?? 99));

  const groupsMap = {};
  const ungrouped = [];
  Object.keys(tree).forEach((topic) => {
    const gs = groupsForTopic(topic);
    if (gs.length === 0) {
      ungrouped.push(topic);
      return;
    }
    gs.forEach(({ title }) => {
      if (!groupsMap[title]) groupsMap[title] = [];
      if (groupsMap[title].indexOf(topic) === -1) groupsMap[title].push(topic);
    });
  });
  groupOrder.forEach((g) => { if (groupsMap[g]) groupsMap[g].sort(sortTopics); });
  ungrouped.sort(sortTopics);

  const hasGroups = groupOrder.length > 0;

  // On first render, expand the group that contains the active lesson
  if (hasGroups && !_groupsInitialized) {
    _groupsInitialized = true;
    if (expandedGroup === null) {
      const aq = questions.find((q) => q.id === activeQuestionId);
      const aqGroups = aq ? groupsForTopic(aq.topic) : [];
      expandedGroup = aqGroups.length ? aqGroups[0].title : groupOrder[0];
    }
  }

  function topicHasMatch(topic) {
    const subs = tree[topic] || {};
    for (const st of Object.keys(subs)) {
      if (subs[st].some((q) => !q.isIntro && q.title.toLowerCase().includes(filterLower))) return true;
    }
    return questions.some((q) => q.isIntro && q.topic === topic && q.title.toLowerCase().includes(filterLower));
  }

  function renderTopic(topic, topicIndex, container) {
    const subtopics = tree[topic];
    const isTopicExpanded = treeExpanded[topic] || filter.length > 0;
    // Use course title from _index.md if available, fall back to directory name
    var topicTitle = topic;
    var tq = questions.find(function(q) { return q.topic === topic && q.topic_title; });
    if (tq) topicTitle = tq.topic_title;

    let hasVisibleChildren = false;
    // Check if there are intro questions for this topic
    const topicIntroQs = questions.filter((q) => q.isIntro && q.topic === topic);
    if (topicIntroQs.length > 0) hasVisibleChildren = true;
    Object.keys(subtopics).forEach((subtopic) => {
      const questionsInSub = subtopics[subtopic];
      const visibleQ = filter.length > 0
        ? questionsInSub.filter((q) => q.title.toLowerCase().includes(filterLower))
        : questionsInSub;
      if (visibleQ.length > 0 || (isTopicExpanded && questionsInSub.length > 0)) {
        hasVisibleChildren = true;
      }
    });

    if (!hasVisibleChildren) return;

    // Topic header
    const topicDiv = document.createElement('div');
    topicDiv.className = 'tree-topic';
    topicDiv.dataset.topicIndex = topicIndex;
    if (filter.length > 0) topicDiv.classList.add('expanded');
    else topicDiv.classList.toggle('expanded', !!treeExpanded[topic]);
    topicDiv.innerHTML = `
      <span class="tree-toggle">
        <i class="bi ${treeExpanded[topic] || filter.length > 0 ? 'bi-chevron-down' : 'bi-chevron-right'}"></i>
      </span>
      <span class="tree-label">${escapeHtml(topicTitle)}</span>
    `;
    topicDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTopic(topic);
    });
    container.appendChild(topicDiv);

    // Introduction leaf nodes (right under the course, above all subtopics)
    if (treeExpanded[topic] || filter.length > 0) {
      const introQs = questions.filter((q) => q.isIntro && q.topic === topic);
      introQs.sort((a, b) => (getWeight(a, 'weight', 99) - getWeight(b, 'weight', 99)));
      introQs.forEach((q) => {
        if (filter.length > 0 && !q.title.toLowerCase().includes(filterLower)) return;
        const item = document.createElement('div');
        item.className = 'tree-leaf';
        item.dataset.id = q.id;
        item.dataset.topicIndex = topicIndex;
        if (q.id === activeQuestionId) item.classList.add('active');
        item.innerHTML = `
          <div class="question-title">${escapeHtml(q.title)}</div>
          <div class="question-meta">Course Overview</div>
        `;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = q.permalink || ('/courses/' + q.topic + '/');
        });
        container.appendChild(item);
      });
    }

    // Subtopic containers
    if (!treeExpanded[topic] && filter.length === 0) return;

    const sortedSubtopics = Object.keys(subtopics).sort((a, b) => {
      const skA = topic + '/' + a;
      const skB = topic + '/' + b;
      return (subtopicWeight[skA] ?? 99) - (subtopicWeight[skB] ?? 99);
    });

    sortedSubtopics.forEach((subtopic) => {
      const questionsInSub = subtopics[subtopic];
      const visibleQ = filter.length > 0
        ? questionsInSub.filter((q) => q.title.toLowerCase().includes(filterLower))
        : questionsInSub;
      if (visibleQ.length === 0 && !(isTopicExpanded && questionsInSub.length > 0)) return;

      const subKey = topic + '/' + subtopic;
      const isSubExpanded = treeExpanded[subKey] || filter.length > 0;

      // Subtopic header
      const subDiv = document.createElement('div');
      subDiv.className = 'tree-subtopic';
      subDiv.dataset.topicIndex = topicIndex;
      if (filter.length > 0) subDiv.classList.add('expanded');
      else subDiv.classList.toggle('expanded', !!treeExpanded[subKey]);
      subDiv.innerHTML = `
        <span class="tree-toggle">
          <i class="bi ${treeExpanded[subKey] || filter.length > 0 ? 'bi-chevron-down' : 'bi-chevron-right'}"></i>
        </span>
        <span class="tree-label">${escapeHtml(subtopic)}</span>
      `;
      subDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSubtopic(topic, subtopic);
      });
      container.appendChild(subDiv);

      // Questions
      if (!isSubExpanded) return;

      const sortedQuestions = [...questionsInSub].sort(
        (a, b) => (getWeight(a, 'weight', 99) - getWeight(b, 'weight', 99))
      );

      sortedQuestions.forEach((q) => {
        if (q.isIntro || q.hidden) return;
        if (filter.length > 0 && !q.title.toLowerCase().includes(filterLower)) return;

        const item = document.createElement('div');
        item.className = 'tree-leaf';
        item.dataset.id = q.id;
        item.dataset.topicIndex = topicIndex;
        if (q.id === activeQuestionId) item.classList.add('active');
        if (submissions[q.id]?.status === 'Accepted') item.classList.add('solved');

        var lessonState = getLessonState(q.id);
        var iconClass = lessonState === 'completed' ? 'bi-check-circle-fill text-pass' : (lessonState === 'in-progress' ? 'bi-circle-half text-in-progress' : 'bi-circle text-muted');
        item.innerHTML = `
          <div class="question-title"><i class="bi ${iconClass} me-1"></i>${escapeHtml(q.title)}</div>
          <div class="question-meta"><span class="diff-pill diff-${q.difficulty||'medium'}">${q.difficulty||'medium'}</span> <span class="leaf-status">${submissions[q.id]?.status || 'Unattempted'}</span></div>
        `;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectQuestion(q.id);
        });
        container.appendChild(item);
      });
    });
  }

  let colorIndex = 0;

  // Ungrouped courses render directly (no group header)
  ungrouped.forEach((topic) => {
    const before = questionListEl.childElementCount;
    renderTopic(topic, colorIndex, questionListEl);
    if (questionListEl.childElementCount > before) colorIndex++;
  });

  // Grouped courses render under collapsible group headers
  groupOrder.forEach((group) => {
    const topics = groupsMap[group];
    if (filter.length > 0 && !topics.some(topicHasMatch)) return;

    const isExpanded = filter.length > 0 ? true : (group === expandedGroup);

    const groupDiv = document.createElement('div');
    groupDiv.className = 'tree-group';
    if (filter.length > 0) groupDiv.classList.add('expanded');
    else groupDiv.classList.toggle('expanded', isExpanded);
    groupDiv.innerHTML = `
      <span class="tree-toggle">
        <i class="bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}"></i>
      </span>
      <span class="tree-label">${escapeHtml(group)}</span>
    `;
    groupDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      expandedGroup = (expandedGroup === group) ? null : group;
      renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
    });
    questionListEl.appendChild(groupDiv);

    if (!isExpanded) return;

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'tree-group-items';
    topics.forEach((topic) => {
      const before = itemsWrap.childElementCount;
      renderTopic(topic, colorIndex, itemsWrap);
      if (itemsWrap.childElementCount > before) colorIndex++;
    });
    questionListEl.appendChild(itemsWrap);
  });
}

function updateTreeItemStatus(id, status) {
  const item = questionListEl?.querySelector(`.tree-leaf[data-id="${id}"]`);
  if (!item) return;
  const meta = item.querySelector('.question-meta');
  const statusEl = meta ? meta.querySelector('.leaf-status') : null;
  if (statusEl) {
    statusEl.textContent = status;
  }
  item.classList.toggle('solved', status === 'Accepted');
}

function selectQuestion(id) {
  const question = questions.find((q) => q.id === id);
  if (!question) return;

  // Course intro question — navigate to the course landing page
  if (question.isIntro) {
    window.location.href = question.permalink || ('/courses/' + question.topic + '/');
    return;
  }

  // Course landing page (/courses/<course>/) — clicking a lesson navigates to it.
  if (/^\/courses\/[^\/]+\/?$/.test(window.location.pathname)) {
    window.location.href = question.permalink;
    return;
  }

  // If the full platform isn't loaded, redirect to the lesson URL. The reading
  // layout has no editor but is still the platform page, so don't redirect there.
  const hasEditor = document.getElementById('editorArea');
  const hasReadingPane = document.getElementById('readingContent') || document.getElementById('readingPane');
  if (!hasEditor && !hasReadingPane) {
    window.location.href = question.permalink;
    return;
  }

  // Persist the current chapter's notes/code before switching. Without this,
  // typing then navigating away within the 1.5s auto-save debounce loses the
  // edits (the pending timer fires against the newly selected chapter instead).
  // Only save once the editor has been populated for the current chapter —
  // on the initial load the empty editor would otherwise overwrite saved notes.
  // Leaving the chapter also leaves the editor view, so push the edit to cloud.
  if (notesEditorPopulated && typeof saveCurrentNotes === 'function' && activeQuestionId) {
    if (saveCurrentNotes()) syncNotesToCloud();
  }
  if (notesEditorPopulated && typeof saveCurrentCode === 'function' && activeQuestionId) saveCurrentCode();
  if (window._notesSaveTimer) { clearTimeout(window._notesSaveTimer); window._notesSaveTimer = null; }
  if (window._codeSaveTimer) { clearTimeout(window._codeSaveTimer); window._codeSaveTimer = null; }

  // A chapter's layout (reading vs code) is fixed when the page loads, so moving
  // to a chapter with a different layout needs a full navigation — an in-place
  // swap would render it into the wrong shell (missing/empty editor, etc.).
  const pageIsCode = !!hasEditor;
  if (pageIsCode !== (question.code_layout === true)) {
    window.location.href = question.permalink;
    return;
  }

  activeQuestionId = id;

  // Restore full platform elements (hidden by intro or landing page)
  if (editorArea) editorArea.classList.remove('d-none');
  if (notesArea) notesArea.classList.remove('d-none');
  if (fileTabs) fileTabs.classList.remove('d-none');
  const ct = document.getElementById('centerTabs');
  if (ct) ct.classList.remove('d-none');

  // On landing page (no question content element), just expand tree and update URL
  if (!questionContentEl) {
    window.location.href = question.permalink;
    return;
  }

  // Set up tabs
  const hasArticle = question.article && question.article.trim().length > 0;
  let quizRaw = question.quiz;
  if (!quizRaw || !quizRaw.trim()) {
    quizRaw = question._raw_quiz;
  }
  const hasQuiz = quizRaw && quizRaw.trim().length > 0;
  const hasReading = !!(question.reading && question.reading.trim().length > 0);
  const hasChallenge = question.has_challenge !== false;
  if (tabArticle) {
    tabArticle.classList.toggle('d-none', !hasArticle);
  }
  if (tabReading) {
    tabReading.classList.toggle('d-none', !hasReading);
  }
  if (tabQuiz) {
    tabQuiz.classList.toggle('d-none', !hasQuiz);
  }
  if (tabChallenge) {
    tabChallenge.classList.toggle('d-none', !hasChallenge);
  }
  // Default tab: chapter URLs land on the Lecture tab. An explicit ?tab=
  // query parameter wins; otherwise prefer Lecture, then the first available tab.
  // In the reading layout on desktop the merged Reading tab is hidden (the
  // right reading pane shows instead), so it is not a valid default there.
  // The merged Reading tab is hidden whenever the reading pane is visible:
  // on desktop (right pane) and on phones (stacked below the center pane).
  const bpMobile = (window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint) || 800;
  const readingMergedHidden = !!document.getElementById('readingPane') &&
    (window.innerWidth > bpMobile || window.innerWidth <= 767);
  const tabAvailable = (t) => t === 'explanation' ? hasArticle : t === 'reading' ? (hasReading && !readingMergedHidden) : t === 'quiz' ? hasQuiz : hasChallenge;
  const urlTab = new URL(window.location).searchParams.get('tab');
  let startTab = 'challenge';
  if (urlTab && tabAvailable(urlTab)) {
    startTab = urlTab;
  } else if (tabAvailable('explanation')) {
    startTab = 'explanation';
  } else {
    startTab = ['reading', 'quiz', 'challenge'].find(tabAvailable) || 'challenge';
  }
  setActiveTab(startTab);

  questionContentEl.innerHTML = question.content;
  // Starter/run_check blocks are consumed by the editor/judge, not shown as prose
  questionContentEl.querySelectorAll('pre[data-starter], [data-run-check]').forEach((el) => el.remove());
  applyAuthGates(questionContentEl);
  enhanceCodeBlocks(questionContentEl);
  enhanceImages(questionContentEl);
  initImageZoom(questionContentEl);
  embedYouTubeLinks(questionContentEl);
  initVimeoPlayers(questionContentEl);
  initHeadingLinks(questionContentEl);
  if (articleContentEl) {
    articleContentEl.innerHTML = hasArticle ? question.article : '';
    articleContentEl.querySelectorAll('pre[data-starter], [data-run-check]').forEach((el) => el.remove());
    applyAuthGates(articleContentEl);
    enhanceCodeBlocks(articleContentEl);
    enhanceImages(articleContentEl);
    initImageZoom(articleContentEl);
    embedYouTubeLinks(articleContentEl);
    initVimeoPlayers(articleContentEl);
    initHeadingLinks(articleContentEl);
  }

  // Reading content: the right-pane (single.html reading layout) or the
  // Reading tab (code layout with a ===READING=== section).
  const renderReading = (el) => {
    if (!el) return;
    // Fallback: when a chapter has no reading section, show its code section
    // as a Practical Lab. If the chapter has neither, hide the pane instead of
    // showing dead space.
    const labRaw = (!hasReading && question.codes && question.codes.trim().length > 0) ? question.codes : '';
    el.innerHTML = hasReading
      ? question.reading
      : (labRaw
        ? '<h2 id="practical-lab">Practical Lab</h2>' + labRaw
        : '<p class="text-muted">No additional material for this chapter.</p>');
    if (!hasReading && !labRaw) {
      const pane = el.closest('.platform-pane');
      if (pane) pane.classList.add('d-none');
    }
    el.querySelectorAll('pre[data-starter], [data-run-check]').forEach((n) => n.remove());
    applyAuthGates(el);
    enhanceCodeBlocks(el);
    enhanceImages(el);
    initImageZoom(el);
    embedYouTubeLinks(el);
    initVimeoPlayers(el);
    initHeadingLinks(el);
  };
  renderReading(document.getElementById('readingContent'));
  renderReading(readingTabContentEl);

  // Inject difficulty badge into the first h2 (Problem Statement)
  const firstH2 = questionContentEl.querySelector('h2:first-of-type');
  if (firstH2) {
    // Remove existing badge margin-right span if any
    const existing = firstH2.querySelector('.diff-badge');
    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.className = 'diff-badge badge ' + (difficultyClasses[question.difficulty] || 'text-bg-secondary');
    badge.textContent = question.difficulty;
    firstH2.appendChild(badge);
  }

  // Set difficulty class on content for background styling
  questionContentEl.classList.remove('diff-easy', 'diff-medium', 'diff-hard');
  if (question.difficulty) {
    questionContentEl.classList.add('diff-' + question.difficulty);
  }

  // Update case title in the center pane titlebar
  const caseTitleEl = document.getElementById('caseTitle');
  if (caseTitleEl) caseTitleEl.textContent = question.title;
  updateBookmarkBtn(activeQuestionId);
  if (languageLabelEl) {
    languageLabelEl.textContent = (question.language || 'c').toUpperCase();
  }
  updateCodeMirrorMode(question.language || 'c');

  // Editor-specific setup only exists in the code layout.
  if (hasEditor) {
    // Build file tabs from ===CODE=== section
    buildFileTabs(question);

    // Restore saved console output or show default
    if (consoleOutputEl) {
      consoleOutputEl.innerHTML = submissions[id] && submissions[id].output ? submissions[id].output : 'When ready, hit Check to compile and run the code.';
    }
    updateStatus(submissions[id] && submissions[id].status ? submissions[id].status : 'Unattempted');
  }

  const savedNotes = notes[id] || '';
  setNotesEditorValue(savedNotes);
  notesEditorPopulated = true;
  if (notesPreviewMode) {
    renderNotesPreview();
  }

  // Expand the tree to show the active problem
  if (question.topic) {
    treeExpanded[question.topic] = true;
    if (question.subtopic) {
      treeExpanded[question.topic + '/' + question.subtopic] = true;
    }
  }
  // Expand the group containing the active lesson
  if (question.topic) {
    const aqGroups = groupsForTopic(question.topic);
    if (aqGroups.length) {
      expandedGroup = aqGroups[0].title;
      _groupsInitialized = true;
    }
  }
  renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
  try {
    let url = question.permalink;
    // Keep the query string (e.g. ?tab=quiz) so shared tab links survive reload.
    url += window.location.search;
    url += window.location.hash;
    history.replaceState(null, '', url);
    maybeSaveProblemUrl(url);
  } catch (e) {
    // History API may be restricted on file:// origins.
  }

  // Scroll to hash if present (e.g. #listing-1 or a heading anchor)
  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        // Switch to the tab that contains the target
        if (articleContentEl && articleContentEl.contains(target) && tabArticle) {
          setActiveTab('explanation');
        } else if (readingTabContentEl && readingTabContentEl.contains(target) && tabReading) {
          setActiveTab('reading');
        } else if (quizContentEl && quizContentEl.contains(target) && tabQuiz) {
          setActiveTab('quiz');
        } else if (questionContentEl && questionContentEl.contains(target) && tabChallenge) {
          setActiveTab('challenge');
        }
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
      }
    }
  }, 100);
}

function updateStatus(status) {
  const displayStatus = status || 'Unattempted';
  if (statusTextEl) {
    statusTextEl.textContent = displayStatus;
    statusTextEl.className = 'small ' + (displayStatus === 'Accepted' ? 'text-pass' :
      displayStatus === 'Wrong Answer' || displayStatus === 'Runtime Error' || displayStatus === 'Compilation Error' ? 'text-fail' : '');
  }
}

function loadSubmissions() {
  try {
    const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (saved) {
      submissions = JSON.parse(saved) || {};
    }
  } catch (e) {
    console.warn('Failed to load saved submissions:', e);
    submissions = {};
  }
}

function persistSubmissions() {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.warn('Failed to save submissions:', e);
  }
}

function resetCase() {
  if (!activeQuestionId) return;
  const question = questions.find((q) => q.id === activeQuestionId);
  if (!question) return;

  if (fileList.length > 0) {
    // Reset active file only
    const file = fileList[activeFileIndex];
    if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
    if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
    submissions[activeQuestionId].files[file.filename] = file.content;
    setEditorValue(file.content);
  } else {
    delete submissions[activeQuestionId];
    setEditorValue('');
  }
  if (!submissions[activeQuestionId]) submissions[activeQuestionId] = { status: 'Unattempted', output: '' };
  submissions[activeQuestionId].status = 'Unattempted';
  updateStatus('Unattempted');
  _dirtySubmissions[activeQuestionId] = true;
  addDirtyId(activeQuestionId);
  if (notes[activeQuestionId] && notes[activeQuestionId].trim()) { _dirtyNotes[activeQuestionId] = true; addDirtyId(activeQuestionId); }
  bumpLocalVersion();
  persistSubmissions();
  // Clear unsaved dot for the reset file
  if (fileList.length > 0) {
    const file = fileList[activeFileIndex];
    delete unsavedFiles[file.filename];
    refreshFileUnsavedDots();
  } else {
    unsavedFiles = {};
    hideAllUnsavedDots();
  }
  renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
}

function resetAllFiles() {
  if (!activeQuestionId) return;
  const question = questions.find((q) => q.id === activeQuestionId);
  if (!question || fileList.length === 0) return;

  fileList.forEach((file) => {
    if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
    if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
    submissions[activeQuestionId].files[file.filename] = file.content;
  });
  setEditorValue(fileList[activeFileIndex].content);
  submissions[activeQuestionId].status = 'Unattempted';
  updateStatus('Unattempted');
  unsavedFiles = {};
  hideAllUnsavedDots();
  _dirtySubmissions[activeQuestionId] = true;
  addDirtyId(activeQuestionId);
  if (notes[activeQuestionId] && notes[activeQuestionId].trim()) { _dirtyNotes[activeQuestionId] = true; addDirtyId(activeQuestionId); }
  bumpLocalVersion();
  persistSubmissions();
  renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
}

function saveCurrentCode() {
  if (!activeQuestionId) return;
  const code = getEditorValue();
  if (fileList.length > 0) {
    const file = fileList[activeFileIndex];
    if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
    if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
    if (submissions[activeQuestionId].files[file.filename] === code) { hideFileUnsavedDot(); return; }
    submissions[activeQuestionId].files[file.filename] = code;
  } else {
    if (!submissions[activeQuestionId]) {
      submissions[activeQuestionId] = { status: 'In Progress', output: '', code: '' };
    }
    if (submissions[activeQuestionId].code === code) { hideFileUnsavedDot(); return; }
    submissions[activeQuestionId].code = code;
  }
  if (!submissions[activeQuestionId].status || submissions[activeQuestionId].status === 'Unattempted') {
    submissions[activeQuestionId].status = 'In Progress';
    updateStatus('In Progress');
    updateTreeItemStatus(activeQuestionId, 'In Progress');
  }
  hideFileUnsavedDot();
  _dirtySubmissions[activeQuestionId] = true;
  addDirtyId(activeQuestionId);
  bumpLocalVersion();
  updateSyncIndicator();
  persistSubmissions();
}

function colorizeOutput(output) {
  if (!output) return '';
  if (output.includes('<span')) return output;
  output = output.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  return output
    .replace(/(All test cases passed\.?)/gi, '<span class="text-pass">$1</span>')
    .replace(/(Test case \d+ failed\.?)/gi, '<span class="text-fail">$1</span>')
    .replace(/(Build succeeded\.?)/gi, '<span class="text-pass">$1</span>')
    .replace(/(Compilation Error\.?)/gi, '<span class="text-fail">$1</span>')
    .replace(/(Runtime Error\.?)/gi, '<span class="text-fail">$1</span>');
}

function initTabs() {
  if (tabChallenge) {
    tabChallenge.addEventListener('click', () => setActiveTab('challenge'));
  }
  if (tabArticle) {
    tabArticle.addEventListener('click', () => setActiveTab('explanation'));
  }
  if (tabReading) {
    tabReading.addEventListener('click', () => setActiveTab('reading'));
  }
  if (tabQuiz) {
    tabQuiz.addEventListener('click', () => setActiveTab('quiz'));
  }
}

function parseQuizData(raw) {
  if (!raw) return [];
  const blocks = raw.split(/\n##\s*/).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.trim().split('\n');
    let question = lines[0].replace(/^##\s*/, '').trim();
    const label = question.toLowerCase();
    if (label === 'question' || label === 'q' || label === 'quiz') {
      question = lines.slice(1).find((l) => l.trim()) || '';
      question = question.trim();
    }
    const options = [];
    let correct = -1;
    let explanation = '';
    let optIdx = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^-\s*\[.\]/.test(line)) {
        const marker = line[3];
        const text = line.slice(5).trim();
        const letters = 'ABCDEFGH';
        options.push({ letter: letters[optIdx] || '', text });
        if (marker.toUpperCase() === 'X') correct = optIdx;
        optIdx++;
      } else if (/^Correct:\s*([A-D])/i.test(line)) {
        const match = line.match(/^Correct:\s*([A-D])/i);
        if (match) correct = match[1].toUpperCase().charCodeAt(0) - 65;
      } else if (/^Explanation:/i.test(line)) {
        explanation = line.replace(/^Explanation:\s*/i, '').trim();
      }
    }
    return { question, options, correct, explanation };
  });
}

function renderQuiz() {
  if (!quizContentEl) return;
  const question = questions.find((q) => q.id === activeQuestionId);
  let quizRaw = question && question.quiz;
  if (!quizRaw || !quizRaw.trim()) {
    quizRaw = question && question._raw_quiz;
  }
  if (!quizRaw || !quizRaw.trim()) {
    quizContentEl.innerHTML = '<p class="text-muted">No quiz available for this lesson.</p>';
    return;
  }
  // With question tags the quiz is pre-rendered server-side into rich
  // segments (prose + questions); otherwise fall back to the legacy line parser.
  const segments = (question && question.quiz_segments && question.quiz_segments.length)
    ? question.quiz_segments : null;
  const items = segments
    ? segments.filter((s) => s.t === 'question').map((s) => ({
        question: s.title || '',
        body: s.body || '',
        options: (s.options || []).map((o, i) => ({ letter: o.letter || String.fromCharCode(65 + i), text: o.html || '' })),
        correct: typeof s.correct === 'number' ? s.correct : -1,
        explanation: s.explanation || '',
        rich: true,
      }))
    : parseQuizData(quizRaw);
  if (items.length === 0) {
    quizContentEl.innerHTML = '<p class="text-muted">No quiz available for this lesson.</p>';
    return;
  }
  const quizId = activeQuestionId || 'quiz-unknown';
  const savedResults = quizResults[quizId] || {};

  const optionHtml = (item, opt, oi, qi) => {
    const wasCorrect = savedResults[qi] === true;
    const isSelected = wasCorrect && oi === item.correct;
    const text = item.rich ? opt.text : escapeHtml(opt.text);
    return `
      <label class="quiz-option d-block py-1 px-2 mb-1${wasCorrect && isSelected ? ' quiz-option-correct' : ''}" data-qi="${qi}" data-oi="${oi}">
        <input type="radio" name="quiz-${qi}" value="${oi}" class="me-2"
          ${wasCorrect ? 'disabled' : ''}
          ${wasCorrect && isSelected ? 'checked' : ''}>
        <span class="option-letter">${opt.letter}.</span> ${text}
      </label>`;
  };

  const questionHtml = (item, qi) => {
    const wasCorrect = savedResults[qi] === true;
    const title = item.rich ? item.question : escapeHtml(item.question);
    const explanation = wasCorrect
      ? '<span class="fw-semibold text-pass">&#10003; Correct!</span> ' + (item.rich ? item.explanation : escapeHtml(item.explanation))
      : '';
    return `
      <div class="quiz-question mb-4" data-q="${qi}" data-solved="${wasCorrect ? 'true' : ''}">
        <p class="fw-semibold mb-2">${title}</p>
        ${item.rich && item.body ? `<div class="quiz-question-body mb-2">${item.body}</div>` : ''}
        <div class="quiz-options">
          ${item.options.map((opt, oi) => optionHtml(item, opt, oi, qi)).join('')}
        </div>
        <div class="quiz-feedback mt-1 small ${wasCorrect ? '' : 'd-none'}">${explanation}</div>
      </div>`;
  };

  let qi = 0;
  const contentHtml = segments
    ? segments.map((seg) => seg.t === 'prose'
        ? `<div class="quiz-prose mb-3">${seg.h}</div>`
        : questionHtml(items[qi], qi++)).join('')
    : items.map((item, i) => questionHtml(item, i)).join('');

  quizContentEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="small text-muted">Quiz: ${escapeHtml(question.title)}</span>
      <button id="resetQuizBtn" class="btn btn-sm btn-outline-secondary">Reset Quiz</button>
    </div>
    ${contentHtml}`;

  // Rich quiz content gets the same enhancements as the reading panes
  // (code block titlebars, figure captions, zoom, embedded videos).
  if (segments) {
    enhanceCodeBlocks(quizContentEl);
    enhanceImages(quizContentEl);
    initImageZoom(quizContentEl);
    embedYouTubeLinks(quizContentEl);
    initVimeoPlayers(quizContentEl);
  }

  function saveQuizResults() {
    try { localStorage.setItem('pyjamacode-quiz-results', JSON.stringify(quizResults)); } catch (e) {}
    _dirtyQuizzes[quizId] = true;
    addDirtyId(quizId);
    bumpLocalVersion();
    updateSyncIndicator();
  }

  quizContentEl.querySelectorAll('.quiz-option input[type="radio"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      if (!requireAuth()) {
        e.target.checked = false;
        return;
      }
      const label = e.target.closest('.quiz-option');
      const qi = parseInt(label.dataset.qi);
      const oi = parseInt(label.dataset.oi);
      const item = items[qi];
      const qDiv = quizContentEl.querySelector(`.quiz-question[data-q="${qi}"]`);
      const feedback = qDiv.querySelector('.quiz-feedback');
      const allLabels = qDiv.querySelectorAll('.quiz-option');

      if (qDiv.dataset.solved === 'true') return;

      allLabels.forEach((l) => { l.classList.remove('quiz-option-correct', 'quiz-option-wrong'); });
      feedback.classList.add('d-none');

      if (oi === item.correct) {
        label.classList.add('quiz-option-correct');
        allLabels.forEach((l) => l.querySelector('input').disabled = true);
        qDiv.dataset.solved = 'true';
        if (!quizResults[quizId]) quizResults[quizId] = {};
        quizResults[quizId][qi] = true;
        saveQuizResults();
        renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
        feedback.className = 'quiz-feedback mt-1 small text-pass';
        feedback.innerHTML = '<span class="fw-semibold">&#10003; Correct!</span> ' + escapeHtml(item.explanation);
        feedback.classList.remove('d-none');
      } else {
        label.classList.add('quiz-option-wrong');
        const nudges = [
          'Not quite. Look at each option carefully — which one matches the definition we explored?',
          'Close, but not right. Compare the options against what you know about this concept.',
          'Almost there. Think about which option best fits the description from the lesson.',
          'Not this one. Try eliminating the options you know are wrong first.',
          'Hmm, not quite. Re-read the question and consider each choice on its own merits.',
          'Good attempt! Now think about why your choice doesn\'t fit — what would need to be true for it to be correct?',
        ];
        feedback.className = 'quiz-feedback mt-1 small text-fail';
        feedback.innerHTML = '<span class="fw-semibold">&#10007;</span> ' + nudges[qi % nudges.length];
        feedback.classList.remove('d-none');
      }
    });
  });

  const resetBtn = document.getElementById('resetQuizBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      delete quizResults[quizId];
      saveQuizResults();
      renderQuiz();
      // Refresh tree to reflect updated lesson status
      renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
    });
  }
}

// Per-problem tab persistence
function saveActiveTab(pid, tab) {
  if (!pid) return;
  var tabs = {};
  try { tabs = JSON.parse(localStorage.getItem('pyjamacode-tabs') || '{}'); } catch (e) { tabs = {}; }
  if (tabs[pid] === tab) return;
  tabs[pid] = tab;
  localStorage.setItem('pyjamacode-tabs', JSON.stringify(tabs));
}

function getSavedTab(pid) {
  if (!pid) return null;
  try {
    var tabs = JSON.parse(localStorage.getItem('pyjamacode-tabs') || '{}');
    return tabs[pid] || null;
  } catch (e) { return null; }
}

function buildTabsMap() {
  var tabs = {};
  try { tabs = JSON.parse(localStorage.getItem('pyjamacode-tabs') || '{}'); } catch (e) { tabs = {}; }
  return tabs;
}

function setActiveTab(tab) {
  if (questionContentEl) questionContentEl.classList.toggle('d-none', tab !== 'challenge');
  if (articleContentEl) articleContentEl.classList.toggle('d-none', tab !== 'explanation');
  if (readingTabContentEl) readingTabContentEl.classList.toggle('d-none', tab !== 'reading');
  if (quizContentEl) quizContentEl.classList.toggle('d-none', tab !== 'quiz');
  if (tabChallenge) tabChallenge.classList.toggle('active', tab === 'challenge');
  if (tabArticle) tabArticle.classList.toggle('active', tab === 'explanation');
  if (tabReading) tabReading.classList.toggle('active', tab === 'reading');
  if (tabQuiz) tabQuiz.classList.toggle('active', tab === 'quiz');

  if (tab === 'quiz') renderQuiz();

  // Show/hide auth blur based on tab
  updateAuthBlur();

  // Update URL with tab parameter: every tab has a shareable deep link
  // (?tab=challenge | explanation | reading | quiz). The plain URL still
  // lands on the Lecture tab by default.
  const url = new URL(window.location);
  url.searchParams.set('tab', tab);
  try {
    history.replaceState(null, '', url.toString());
  } catch (e) {}

  // Save per-problem tab state
  saveActiveTab(activeQuestionId, tab);

  // Scroll to hash after tab switch
  setTimeout(() => {
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 50);
}

function initTypedTitle() {
  const typedEl = document.getElementById('typedTitle');
  if (!typedEl || typeof Typed === 'undefined') return;
  const title = typedEl.textContent || '';
  if (window.location.pathname === '/' || window.location.pathname === '') {
    typedEl.textContent = '';
    new Typed('#typedTitle', {
      strings: [title],
      typeSpeed: 60,
      loop: false,
      showCursor: true,
      cursorChar: '_',
    });
  } else {
    typedEl.textContent = title;
    typedEl.innerHTML = title + '<span class="typed-cursor typed-cursor--blink" aria-hidden="true">_</span>';
  }
}

function enhanceImages(root) {
  if (!root) return;
  let figureCounter = 0;
  root.querySelectorAll('p > img').forEach((img) => {
    const p = img.parentElement;
    // Only standalone images (the <p> contains nothing else).
    if (p.children.length !== 1) return;

    figureCounter++;
    let alt = (img.alt || '').trim();
    // The alt text is the description; drop surrounding quotes when the
    // author wrapped the whole description in them.
    const quotePairs = [['\u201C', '\u201D'], ['\u2018', '\u2019'], ['"', '"'], ["'", "'"]];
    for (let i = 0; i < quotePairs.length; i++) {
      const open = quotePairs[i][0], close = quotePairs[i][1];
      if (alt.length > 1 && alt.charAt(0) === open && alt.charAt(alt.length - 1) === close) {
        alt = alt.slice(1, -1).trim();
        break;
      }
    }

    const figure = document.createElement('figure');
    figure.className = 'cb-figure';
    figure.appendChild(img);
    if (alt) {
      const cap = document.createElement('figcaption');
      cap.className = 'cb-figure-caption';
      // Linkable caption like the code listings, so figures can be deep-linked.
      const anchor = document.createElement('a');
      anchor.className = 'cb-figure-link';
      const slug = slugify(alt);
      anchor.id = 'figure-' + figureCounter + (slug ? '-' + slug : '');
      anchor.href = '#' + anchor.id;
      anchor.textContent = 'Figure ' + figureCounter + '. ' + alt;
      cap.appendChild(anchor);
      figure.appendChild(cap);
    }
    p.parentElement.replaceChild(figure, p);
  });
}

function initImageZoom(root) {
  if (!root) return;
  root.querySelectorAll('figure img').forEach((img) => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const overlay = document.getElementById('imageZoomOverlay');
      const zoomImg = document.getElementById('imageZoomImg');
      zoomImg.src = img.src;
      zoomImg.alt = img.alt;
      overlay.style.display = 'flex';
    });
  });
}

function applyAuthGates(container) {
  if (!container) return false;
  const html = container.innerHTML;
  const openTag = '<!--gated-->';
  const closeTag = '<!--/gated-->';
  if (html.indexOf(openTag) === -1) return false;

  container.innerHTML = '';
  let remaining = html;
  let lastEnd = 0;
  const authed = isAuthenticated();

  const addFragment = (text) => {
    if (!text) return;
    const div = document.createElement('div');
    div.innerHTML = text;
    while (div.firstChild) container.appendChild(div.firstChild);
  };

  while (true) {
    const start = remaining.indexOf(openTag, lastEnd);
    if (start === -1) break;
    const end = remaining.indexOf(closeTag, start + openTag.length);
    if (end === -1) break;

    // Content before this gate pair — always visible
    addFragment(remaining.slice(lastEnd, start));

    // Gated content
    const gatedContent = remaining.slice(start + openTag.length, end);

    const gatedDiv = document.createElement('div');
    gatedDiv.style.position = 'relative';

    const blurInner = document.createElement('div');
    blurInner.className = 'auth-gated';
    blurInner.innerHTML = gatedContent;
    gatedDiv.appendChild(blurInner);

    const overlay = document.createElement('div');
    overlay.className = 'gated-overlay';
    overlay.innerHTML = '<p>Sign in to access the content, save progress and execute code.</p><button class="btn btn-sm btn-primary" onclick="if(typeof openAuthModal===\'function\')openAuthModal(\'signin\')">Sign in</button>';
    gatedDiv.appendChild(overlay);

    container.appendChild(gatedDiv);

    blurInner.classList.toggle('content-blurred-force', !authed);
    overlay.classList.toggle('show', !authed);

    lastEnd = end + closeTag.length;
  }

  // Content after the last gate pair
  addFragment(remaining.slice(lastEnd));

  // Guard: if someone deletes the overlay from devtools, also delete the gated content
  if (!window._gateGuard) {
    var _gating = false;
    window._gateGuard = new MutationObserver(function() {
      if (_gating) return;
      _gating = true;
      document.querySelectorAll('.gated-overlay').forEach(function(overlay) {
        if (!document.body.contains(overlay)) {
          var parent = overlay.closest('[style*="position: relative"]');
          if (parent) {
            var blurInner = parent.querySelector('.auth-gated');
            if (blurInner) blurInner.remove();
            parent.remove();
          }
        }
      });
      _gating = false;
    });
    window._gateGuard.observe(document.body, { childList: true, subtree: true });
  }

  return true;
}

function embedYouTubeLinks(root) {
  if (!root) return;
  root.querySelectorAll('p, div, li').forEach((el) => {
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3 && node.textContent) {
        const m = node.textContent.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
        if (m) {
          const span = document.createElement('span');
          span.innerHTML = '<br><div class="ratio ratio-16x9 my-3"><iframe src="https://www.youtube.com/embed/' + m[1] + '" allowfullscreen></iframe></div><br>';
          node.parentNode.replaceChild(span, node);
        }
      }
    });
  });
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function enhanceCodeBlocks(root, opts) {
  const skipCaption = opts && opts.skipCaption;
  if (!root) return;
  let listingCounter = 0;
  const blocks = root.querySelectorAll('pre > code');
  blocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (pre.classList.contains('cm-wrapper')) return;

    listingCounter++;
    const lang = extractLanguage(codeEl);
    const langId = extractLangId(codeEl) || 'c';
    const fileAttr = codeEl.getAttribute('data-file') || pre.getAttribute('data-file') || '';
    const captionText = codeEl.getAttribute('data-caption') || pre.getAttribute('data-caption') || '';
    const runCmd = pre.getAttribute('data-cmd') || '';
    // A snippet is runnable only when it defines the command to run.
    const canRun = false;
    // Titlebar text: the filename when given, otherwise the language name.
    const titleText = fileAttr || lang;
    // The actual filename written for the judge: `file` wins when given.
    const runFile = fileAttr || ('main.' + langId);
    const rawCode = codeEl.textContent || '';

    // Apply highlight.js syntax highlighting
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(codeEl);
    }

    // Preserve syntax-highlighted HTML, split by newlines
    const html = codeEl.innerHTML;
    const lineHtmls = html.split(/\n/);
    const lineCount = lineHtmls.length;

    // Build line-numbered HTML preserving syntax spans
    let numberedHtml = '';
    for (let i = 0; i < lineCount; i++) {
      const lineNum = i + 1;
      numberedHtml += `<div class="cb-line" data-line="${lineNum}">`;
      numberedHtml += `<span class="cb-ln">${lineNum}</span>`;
      numberedHtml += `<span class="cb-code">${lineHtmls[i] || ' '}</span>`;
      numberedHtml += `</div>`;
    }
    codeEl.innerHTML = numberedHtml;

    const wrapper = document.createElement('div');
    wrapper.className = 'cb-wrapper';
    // Anchor suffix: the caption when present, else the filename, so listings
    // with the same number on different pages still get distinct, shareable links.
    const anchorSlug = slugify(captionText || fileAttr);
    const listingId = 'listing-' + listingCounter + (anchorSlug ? '-' + anchorSlug : '');

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'cb-titlebar';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'cb-title';
    titleSpan.textContent = titleText;
    titleBar.appendChild(titleSpan);
    const actions = document.createElement('span');
    actions.className = 'cb-actions';
    titleBar.appendChild(actions);
    if (canRun) {
      const runBtn = document.createElement('button');
      runBtn.className = 'cb-copy';
      runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'cb-copy';
      resetBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Reset';
      actions.appendChild(runBtn);
      actions.appendChild(resetBtn);
      titleBar._runBtn = runBtn;
      titleBar._resetBtn = resetBtn;
    } else {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'cb-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(rawCode).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
      });
      actions.appendChild(copyBtn);
    }
    wrapper.appendChild(titleBar);

    // Code area (read-only listing, as before)
    const codeArea = document.createElement('div');
    codeArea.className = 'cb-code-area';
    codeArea.appendChild(codeEl);
    wrapper.appendChild(codeArea);

    // Runnable blocks are read-only. Run executes the fixed snippet via the
    // judge; output appears in a collapsible drop-down under the block.
    if (canRun) {
      const outPanel = document.createElement('div');
      outPanel.className = 'cb-output d-none';
      outPanel.innerHTML =
        '<div class="cb-output-head">' +
          '<span class="cb-output-toggle"><i class="bi bi-chevron-down"></i> Output</span>' +
          '<button type="button" class="cb-output-close" aria-label="Hide output"><i class="bi bi-x-lg"></i></button>' +
        '</div>' +
        '<pre class="cb-output-body"></pre>';
      wrapper.appendChild(outPanel);
      const outBody = outPanel.querySelector('.cb-output-body');
      outPanel.querySelector('.cb-output-head').addEventListener('click', (e) => {
        if (e.target.closest('.cb-output-close')) return;
        outPanel.classList.toggle('collapsed');
      });
      outPanel.querySelector('.cb-output-close').addEventListener('click', () => {
        outPanel.classList.add('d-none');
      });

      const runBtn = titleBar._runBtn;
      const resetBtn = titleBar._resetBtn;

      runBtn.addEventListener('click', () => {
        if (!requireAuthForRun()) {
          outPanel.classList.remove('d-none', 'collapsed');
          outBody.innerHTML = '<span class="text-fail">Sign in to run code.</span>';
          return;
        }
        outPanel.classList.remove('d-none', 'collapsed');
        outBody.innerHTML = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) + '\nRunning...';
        runBtn.disabled = true;
        fetch(JUDGE_URL + '/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: [{ name: runFile, content: rawCode }], command: runCmd }),
        })
          .then((r) => r.json())
          .then((res) => {
            const body = (res.stdout || '') + (res.stderr || '');
            let html = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) + '\n';
            html += ansiToHtml(body) || '<span class="text-muted">(no output)</span>';
            if (res.timedOut) html += '\n<small class="text-muted">Timed out</small>';
            outBody.innerHTML = html;
          })
          .catch((err) => {
            outBody.innerHTML = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) +
              '\n<span class="text-fail">Connection error</span>\n' + escapeHtml(err.message || '');
          })
          .then(() => { runBtn.disabled = false; });
      });

      resetBtn.addEventListener('click', () => {
        outBody.textContent = '';
        outPanel.classList.add('d-none');
      });
    }

    // Caption with anchor (outside wrapper): the caption text when present,
    // otherwise the filename, so the listing label stays self-describing.
    const caption = (skipCaption ? '' : 'Listing ' + listingCounter + (captionText ? '. ' + captionText : (fileAttr ? '. ' + fileAttr : '.')));
    pre.parentElement.replaceChild(wrapper, pre);
    if (caption) {
      const captionEl = document.createElement('div');
      captionEl.className = 'cb-note';
      const anchor = document.createElement('a');
      anchor.className = 'cb-listing-link';
      anchor.id = listingId;
      anchor.href = '#' + listingId;
      anchor.textContent = caption;
      captionEl.appendChild(anchor);
      wrapper.after(captionEl);
    }
  });

  // Click-to-highlight lines (skip if user is selecting text)
  root.querySelectorAll('.cb-line').forEach((line) => {
    line.addEventListener('click', (e) => {
      if (e.target.closest('.cb-ln')) return;
      if (window.getSelection().toString().length > 0) return;
      const wasActive = line.classList.contains('active');
      const parent = line.closest('.cb-code-area');
      if (parent) {
        parent.querySelectorAll('.cb-line.active').forEach((l) => l.classList.remove('active'));
      }
      if (!wasActive) {
        line.classList.add('active');
      }
    });
  });
}

function extractLanguage(codeEl) {
  for (const cls of codeEl.classList) {
    if (cls.startsWith('language-')) {
      let lang = cls.slice(9);
      const map = { c: 'C', cpp: 'C++', cs: 'C#', js: 'JavaScript', ts: 'TypeScript',
        py: 'Python', rb: 'Ruby', go: 'Go', rs: 'Rust', asm: 'Assembly', gas: 'Assembly',
        bash: 'Bash', sh: 'Shell', makefile: 'Makefile', text: 'Text', plaintext: 'Text',
        html: 'HTML', css: 'CSS', json: 'JSON', xml: 'XML', yaml: 'YAML', toml: 'TOML',
        md: 'Markdown', markdown: 'Markdown', sql: 'SQL', diff: 'Diff' };
      return map[lang] || lang.toUpperCase();
    }
  }
  return '';
}

function initProblemNav() {
  const prevBtn = document.getElementById('prevProblemBtn');
  const nextBtn = document.getElementById('nextProblemBtn');
  if (!prevBtn || !nextBtn) return;

  function getFlatTree() {
    const tree = buildQuestionTree();
    const result = [];
    const topicKeys = Object.keys(tree).sort((a, b) => {
      const ga = getGroupWeight(a) ?? 0;
      const gb = getGroupWeight(b) ?? 0;
      if (ga !== gb) return ga - gb;
      return (getTopicWeight(a) ?? 99) - (getTopicWeight(b) ?? 99);
    });
    topicKeys.forEach((topic) => {
      const subtopics = tree[topic];
      const subKeys = Object.keys(subtopics).sort((a, b) => {
        const skA = topic + '/' + a;
        const skB = topic + '/' + b;
        return (getSubtopicWeight(skA) ?? 99) - (getSubtopicWeight(skB) ?? 99);
      });
      subKeys.forEach((sub) => {
        const qs = [...subtopics[sub]].sort(
          (a, b) => (getWeight(a, 'weight', 99) - getWeight(b, 'weight', 99))
        );
        qs.forEach((q) => result.push(q));
      });
    });
    return result;
  }

  function getTopicWeight(topic) {
    let w;
    questions.forEach((q) => {
      if (q.topic === topic) {
        const tw = getWeight(q, 'topic_weight', 99);
        if (w === undefined || tw < w) w = tw;
      }
    });
    return w;
  }

  function getGroupWeight(topic) {
    const gs = groupsForTopic(topic);
    if (!gs.length) return undefined;
    return gs.reduce((min, g) => Math.min(min, g.weight ?? 99), 99);
  }

  function getSubtopicWeight(key) {
    let w;
    questions.forEach((q) => {
      const sk = q.topic + '/' + q.subtopic;
      if (sk === key) {
        const sw = getWeight(q, 'subtopic_weight', 99);
        if (w === undefined || sw < w) w = sw;
      }
    });
    return w;
  }

  // Visible (DOM) tabs, in on-screen order. Prev/next should only walk tabs the
  // user can see: the Reading tab exists only in the code layout (in the reading
  // layout the reading pane is always shown on the right and is skipped).
  function getAvailableTabs() {
    const pairs = [
      ['explanation', tabArticle],
      ['reading', tabReading],
      ['quiz', tabQuiz],
      ['challenge', tabChallenge],
    ];
    return pairs
      .filter(([, el]) => el && !el.classList.contains('d-none'))
      .map(([name]) => name);
  }

  function hasArticleForId(id) {
    const q = questions.find((x) => x.id === id);
    return q && q.article && q.article.trim().length > 0;
  }

  function hasQuizForId(id) {
    const q = questions.find((x) => x.id === id);
    if (!q || !q.quiz) return false;
    let raw = q.quiz;
    if ((!raw || !raw.trim()) && q.quiz2) {
      const m = q.quiz2.match(/===QUIZ===\n([\s\S]*)$/) || q.quiz2.match(/<!--\s*quiz\s*-->([\s\S]*?)<!--\s*\/\s*quiz\s*-->/);
      if (m) raw = m[1].trim();
    }
    return raw && raw.trim().length > 0;
  }

  const navigate = (dir) => {
    const flat = getFlatTree();
    const idx = flat.findIndex((q) => q.id === activeQuestionId);
    if (idx < 0) return;

    // Get current tab index
    const currentTab = getActiveTabName();
    const available = getAvailableTabs();
    const currentTabIdx = available.indexOf(currentTab);

    if (currentTabIdx === -1) {
      // Fallback: navigate to next/prev problem
      const target = idx + dir;
      if (target < 0 || target >= flat.length) return;
      selectQuestion(flat[target].id);
      return;
    }

    const nextTabIdx = currentTabIdx + dir;

    if (nextTabIdx >= 0 && nextTabIdx < available.length) {
      // Same chapter, different tab
      setActiveTab(available[nextTabIdx]);
    } else {
      // Move to next/prev chapter
      const target = idx + dir;
      if (target < 0 || target >= flat.length) return;
      selectQuestion(flat[target].id);
    }
  };

  function getActiveTabName() {
    if (tabArticle && tabArticle.classList.contains('active')) return 'explanation';
    if (tabReading && tabReading.classList.contains('active')) return 'reading';
    if (tabQuiz && tabQuiz.classList.contains('active')) return 'quiz';
    if (articleContentEl && !articleContentEl.classList.contains('d-none')) return 'explanation';
    if (readingTabContentEl && !readingTabContentEl.classList.contains('d-none')) return 'reading';
    if (quizContentEl && !quizContentEl.classList.contains('d-none')) return 'quiz';
    return 'challenge';
  }

  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));
}

function initSidebarToggle() {
  const hideBtn = document.getElementById('sidebarHideBtn');
  const showBtn = document.getElementById('sidebarShowBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  const sidebar = document.getElementById('sidebarPane');
  const body = document.body;
  if (!hideBtn || !showBtn || !sidebar) return;

  // Create backdrop for mobile overlay
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function isMobile() {
    const bp = (window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint) || 800;
    return window.innerWidth <= bp;
  }

  function updateUI(collapsed) {
    if (isMobile()) {
      sidebar.classList.toggle('sidebar-open', !collapsed);
      backdrop.classList.toggle('show', !collapsed);
      showBtn.classList.toggle('d-none', !collapsed);
      hideBtn.classList.add('d-none');
      if (closeBtn) closeBtn.classList.toggle('d-none', collapsed);
    } else {
      body.classList.toggle('sidebar-collapsed', collapsed);
      hideBtn.classList.toggle('d-none', collapsed);
      showBtn.classList.toggle('d-none', !collapsed);
      sidebar.style.width = '';
      sidebar.classList.remove('sidebar-open');
      backdrop.classList.remove('show');
      if (closeBtn) closeBtn.classList.add('d-none');
    }
    hideBtn.setAttribute('title', collapsed ? 'Show sidebar' : 'Collapse sidebar');
    showBtn.setAttribute('title', collapsed ? 'Show sidebar' : 'Collapse sidebar');
  }

  // Restore saved state (only for desktop collapse)
  if (!isMobile() && localStorage.getItem('sidebarCollapsed') === 'true') {
    updateUI(true);
  }

  function toggle() {
    const isCollapsed = isMobile()
      ? !sidebar.classList.contains('sidebar-open')
      : body.classList.contains('sidebar-collapsed');
    updateUI(!isCollapsed);
    if (!isMobile()) localStorage.setItem('sidebarCollapsed', !isCollapsed);
    [hideBtn, showBtn].forEach((btn) => {
      if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tp = bootstrap.Tooltip.getInstance(btn);
        if (tp) tp.hide();
      }
    });
    setTimeout(() => { if (codeMirror) codeMirror.refresh(); }, 250);
  }

  hideBtn.addEventListener('click', toggle);
  showBtn.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', toggle);
  backdrop.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.remove('sidebar-open');
      backdrop.classList.remove('show');
      showBtn.classList.remove('d-none');
    }
  });

  // Listen for resize to switch between mobile/desktop modes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMobile()) {
        sidebar.classList.remove('sidebar-open');
        backdrop.classList.remove('show');
        hideBtn.classList.add('d-none');
        showBtn.classList.remove('d-none');
      } else {
        sidebar.classList.remove('sidebar-open');
        backdrop.classList.remove('show');
        const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (wasCollapsed) {
          body.classList.add('sidebar-collapsed');
          hideBtn.classList.add('d-none');
          showBtn.classList.remove('d-none');
        } else {
          body.classList.remove('sidebar-collapsed');
          hideBtn.classList.remove('d-none');
          showBtn.classList.add('d-none');
        }
      }
      if (closeBtn) closeBtn.classList.toggle('d-none', !isMobile());
    }, 200);
  });

  // Initial state on page load
  if (isMobile()) {
    sidebar.classList.remove('sidebar-open');
    backdrop.classList.remove('show');
    hideBtn.classList.add('d-none');
    showBtn.classList.remove('d-none');
    if (closeBtn) closeBtn.classList.remove('d-none');
  }
}

function initVimeoPlayers(root) {
  if (!root) return;
  root.querySelectorAll('.vm-wrapper').forEach((wrapper) => {
    if (wrapper.dataset.vmInit) return;
    wrapper.dataset.vmInit = '1';

    const videoId = wrapper.dataset.videoId;
    const thumb = wrapper.querySelector('.vm-thumb');
    const playerDiv = wrapper.querySelector('.vm-player');
    const shield = wrapper.querySelector('.vm-shield');
    const controls = wrapper.querySelector('.vm-controls');
    const playBtn = controls ? controls.querySelector('.vmc-play i') : null;
    const muteBtn = controls ? controls.querySelector('.vmc-mute i') : null;
    const fsBtn = controls ? controls.querySelector('.vmc-fs') : null;
    const fill = controls ? controls.querySelector('.vmc-fill') : null;
    const currentEl = controls ? controls.querySelector('.vmc-current') : null;
    const durationEl = controls ? controls.querySelector('.vmc-duration') : null;
    const track = controls ? controls.querySelector('.vmc-track') : null;
    if (!videoId) return;

    let player = null;
    let seeking = false;

    const show = () => {
      playerDiv.style.display = 'block';
      if (shield) shield.style.display = 'block';
      if (controls) controls.style.display = 'flex';
      const img = thumb.querySelector('img');
      const pbtn = thumb.querySelector('.vm-playbtn');
      if (img) img.style.display = 'none';
      if (pbtn) pbtn.style.display = 'none';

      const iframe = playerDiv.querySelector('iframe');
      if (typeof Vimeo !== 'undefined' && Vimeo.Player) {
        player = new Vimeo.Player(iframe);
        player.setVolume(1);
        player.play();

        player.on('play', () => {
          if (controls) { controls.style.opacity = '1'; controls.classList.add('vm-controls-show'); }
          if (playBtn) playBtn.className = 'bi bi-pause-fill';
          startProgress();
          hideControlsAfterDelay();
        });

        player.on('pause', () => {
          if (playBtn) playBtn.className = 'bi bi-play-fill';
          stopProgress();
          if (controls) controls.style.opacity = '1';
        });

        player.on('ended', () => {
          if (playBtn) playBtn.className = 'bi bi-play-fill';
          stopProgress();
          if (controls) controls.style.opacity = '1';
        });

        player.on('timeupdate', (data) => {
          if (seeking) return;
          const pct = data.percent * 100;
          if (fill) fill.style.width = pct + '%';
          if (currentEl) currentEl.textContent = formatTimeV(data.seconds);
        });

        player.getDuration().then((d) => {
          if (durationEl) durationEl.textContent = formatTimeV(d);
        });
      }
    };

    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.vmc-btn') || e.target.closest('.vmc-track')) return;
      if (player) {
        player.getPaused().then((p) => { if (p) player.play(); else player.pause(); });
      } else {
        show();
      }
    });

    if (playBtn) {
      playBtn.closest('.vmc-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (player) {
          player.getPaused().then((p) => { if (p) player.play(); else player.pause(); });
        } else {
          show();
        }
      });
    }

    if (muteBtn) {
      muteBtn.closest('.vmc-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (player) {
          player.getVolume().then((v) => {
            if (v > 0) { player.setVolume(0); muteBtn.className = 'bi bi-volume-mute-fill'; }
            else { player.setVolume(1); muteBtn.className = 'bi bi-volume-up-fill'; }
          });
        }
      });
    }

    if (fsBtn) {
      fsBtn.closest('.vmc-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement) document.exitFullscreen();
        else wrapper.requestFullscreen();
      });
    }

    // Quality selector
    const qualityMenu = wrapper.querySelector('.vmc-quality-menu');
    const qualityBtn = wrapper.querySelector('.vmc-quality-btn');
    if (qualityBtn && qualityMenu) {
      const content = qualityMenu.querySelector('.vmc-dropdown-content');
      qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = content.style.display === 'block';
        // Close all dropdowns
        wrapper.querySelectorAll('.vmc-dropdown-content').forEach((c) => c.style.display = 'none');
        if (!isOpen && player) content.style.display = 'block';
      });
      wrapper.addEventListener('click', () => { if (content) content.style.display = 'none'; });
      if (player) {
        player.getQualities().then((qs) => {
          if (qs.length > 1) {
            content.innerHTML = qs.map((q) => {
              const label = q.label || q.id;
              const active = q.active ? 'active' : '';
              return '<a data-quality="' + q.id + '" class="' + active + '">' + label + '</a>';
            }).join('');
            content.querySelectorAll('a').forEach((el) => {
              el.addEventListener('click', (e) => {
                e.stopPropagation();
                player.setQuality(el.dataset.quality);
                content.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
                el.classList.add('active');
                qualityBtn.textContent = el.textContent;
                content.style.display = 'none';
              });
            });
          } else {
            qualityMenu.style.display = 'none';
          }
        });
      }
    }

    // Speed selector
    const speedMenu = wrapper.querySelector('.vmc-speed-menu');
    const speedBtn = wrapper.querySelector('.vmc-speed-btn');
    if (speedBtn && speedMenu) {
      const content = speedMenu.querySelector('.vmc-dropdown-content');
      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      content.innerHTML = speeds.map((s) => {
        const active = s === 1 ? 'active' : '';
        return '<a data-speed="' + s + '" class="' + active + '">' + s + 'x</a>';
      }).join('');
      speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = content.style.display === 'block';
        wrapper.querySelectorAll('.vmc-dropdown-content').forEach((c) => c.style.display = 'none');
        if (!isOpen && player) content.style.display = 'block';
      });
      content.querySelectorAll('a').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const speed = parseFloat(el.dataset.speed);
          if (player) player.setPlaybackRate(speed);
          content.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
          el.classList.add('active');
          speedBtn.textContent = speed + 'x';
          content.style.display = 'none';
        });
      });
    }

    if (track) {
      track.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        seeking = true;
        seekV(e);
        const onMove = (ev) => seekV(ev);
        const onUp = () => { seeking = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    let ctrlTimer = null;
    const showControlsFade = () => {
      if (controls && controls.style.display !== 'none') {
        controls.style.opacity = '1';
        clearTimeout(ctrlTimer);
        if (player) {
          player.getPaused().then((p) => {
            if (!p) ctrlTimer = setTimeout(() => { if (controls) controls.style.opacity = '0'; }, 3000);
          }).catch(() => {});
        }
      }
    };

    wrapper.addEventListener('mousemove', showControlsFade);

    function hideControlsAfterDelay() {
      clearTimeout(ctrlTimer);
      ctrlTimer = setTimeout(() => { if (controls) controls.style.opacity = '0'; }, 3000);
    }
    function clearControlsTimer() { if (ctrlTimer) { clearTimeout(ctrlTimer); ctrlTimer = null; } }

    function seekV(e) {
      if (!player || !track) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      player.setCurrentTime(pct * 1);
      player.getDuration().then((d) => { player.setCurrentTime(pct * d); });
    }

    let progInterval = null;
    function startProgress() { stopProgress(); progInterval = setInterval(() => {
      if (!player || !fill || !currentEl) return;
      if (seeking) return;
      player.getCurrentTime().then((ct) => {
        player.getDuration().then((d) => {
          if (d > 0) fill.style.width = (ct / d * 100) + '%';
          currentEl.textContent = formatTimeV(ct);
        });
      });
    }, 200); }
    function stopProgress() { if (progInterval) { clearInterval(progInterval); progInterval = null; } }
  });
}

function formatTimeV(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function ansiToHtml(text) {
  if (!text) return '';
  let s = text.split('\n').map(l => { const p = l.split('\r'); return p[p.length-1]; }).join('\n');
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\t/g, '  ');

  const AN = {
    1: [0,'b'], 3: [0,'i'], 4: [0,'u'],
    30:[1,0], 31:[1,1], 32:[1,2], 33:[1,3], 34:[1,4], 35:[1,5], 36:[1,6], 37:[1,7],
    90:[1,8], 91:[1,9], 92:[1,10], 93:[1,11], 94:[1,12], 95:[1,13], 96:[1,14], 97:[1,15],
    40:[2,0], 41:[2,1], 42:[2,2], 43:[2,3], 44:[2,4], 45:[2,5], 46:[2,6], 47:[2,7],
    100:[2,8], 101:[2,9], 102:[2,10], 103:[2,11], 104:[2,12], 105:[2,13], 106:[2,14], 107:[2,15],
  };
  const STYLES = [
    '', 'font-weight:bold', 'font-style:italic', 'text-decoration:underline',
  ];

  const re = /\x1b\[([0-9;]*)m/g;
  let out = '', last = 0, state = {}, open = false, m;
  while ((m = re.exec(s)) !== null) {
    out += s.slice(last, m.index);
    if (open) { out += '</span>'; open = false; }
    const codes = m[1] ? m[1].split(';') : ['0'];
    for (const c of codes) {
      if (c === '0' || c === '') { state = {}; }
      else if (AN[c]) {
        const [type, val] = AN[c];
        if (type === 0) state['s'+val] = true;
        else if (type === 1) state.fg = val;
        else if (type === 2) state.bg = val;
      }
    }
    const parts = [];
    if (state.sb) parts.push(STYLES[1]);
    if (state.si) parts.push(STYLES[2]);
    if (state.su) parts.push(STYLES[3]);
    if (state.fg !== undefined) parts.push('color:var(--ansi-'+state.fg+')');
    if (state.bg !== undefined) parts.push('background-color:var(--ansi-'+state.bg+')');
    if (parts.length) { out += '<span style="'+parts.join(';')+'">'; open = true; }
    last = m.index + m[0].length;
  }
  out += s.slice(last);
  if (open) out += '</span>';
  return out;
}

/* ─── File Tabs ─── */
function extractLangId(codeEl) {
  for (const cls of codeEl.classList) {
    if (cls.startsWith('language-')) return cls.slice(9).toLowerCase();
  }
  return '';
}

function collectCodeFiles(html) {
  const files = [];
  if (!html) return files;
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('pre').forEach((pre) => {
    const codeEl = pre.querySelector('code');
    if (!codeEl) return;
    const raw = pre.getAttribute('data-file') || '';
    const lang = extractLangId(codeEl);
    const filename = raw || 'untitled.' + (lang || 'c');
    const content = codeEl.textContent || '';
    files.push({ filename: filename, lang: lang || 'c', mode: langToMode(lang || 'c'), content: content });
  });
  return files;
}

function buildFileTabs(question) {
  fileList = [];
  activeFileIndex = 0;
  unsavedFiles = {};

  // 1. Starter code from {{< starter >}} shortcodes embedded in the section
  //    content (challenge/article). Highest precedence.
  const starterHtml = (question.content || '') + (question.article || '');
  if (starterHtml.indexOf('data-starter') !== -1) {
    const div = document.createElement('div');
    div.innerHTML = starterHtml;
    div.querySelectorAll('pre[data-starter]').forEach((pre) => {
      const codeEl = pre.querySelector('code');
      if (!codeEl) return;
      const raw = pre.getAttribute('data-file') || '';
      const lang = extractLangId(codeEl);
      const filename = raw || 'main.c';
      fileList.push({ filename: filename, lang: lang || 'c', mode: langToMode(lang || 'c'), content: codeEl.textContent || '' });
    });
  }

  // 2. Files from the ===CODE=== section.
  if (fileList.length === 0 && question.codes) {
    fileList = collectCodeFiles(question.codes);
  }

  // Render tabs
  if (fileTabs) {
    fileTabs.innerHTML = '';
    fileList.forEach((file, idx) => {
      const tab = document.createElement('div');
      tab.className = 'file-tab' + (idx === activeFileIndex ? ' active' : '');
      const dot = document.createElement('i');
      dot.className = 'bi bi-dot';
      dot.style.fontSize = '1em';
      dot.style.verticalAlign = 'middle';
      tab.appendChild(dot);
      tab.appendChild(document.createTextNode(file.filename));
      tab.addEventListener('click', () => switchFileTab(idx));
      fileTabs.appendChild(tab);
    });
  }

  // Show/hide reset all button
  if (resetAllBtn) resetAllBtn.classList.toggle('d-none', fileList.length <= 1);

  // Load active file content
  loadActiveFile(question);
}

function loadActiveFile(question) {
  if (!question) return;
  const id = question.id;
  let code = '';
  if (fileList.length > 0) {
    const file = fileList[activeFileIndex];
    const saved = submissions[id]?.files?.[file.filename];
    code = saved || file.content;
    if (languageLabelEl) languageLabelEl.textContent = langToLabel(file.lang);
    updateCodeMirrorMode(file.lang);
  } else {
    const saved = submissions[id]?.code;
    code = saved || '';
    if (languageLabelEl) languageLabelEl.textContent = langToLabel(question.language || 'c');
    updateCodeMirrorMode(question.language || 'c');
  }
  setEditorValue(code);
}

function switchFileTab(idx) {
  if (idx === activeFileIndex) return;
  // Save current file code
  if (activeQuestionId && fileList.length > 0) {
    const file = fileList[activeFileIndex];
    if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
    if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
    submissions[activeQuestionId].files[file.filename] = getEditorValue();
    delete unsavedFiles[file.filename];
  }
  activeFileIndex = idx;
  // Update tab styles
  if (fileTabs) {
    fileTabs.querySelectorAll('.file-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });
  }
  // Load new file
  const question = questions.find((q) => q.id === activeQuestionId);
  if (question) loadActiveFile(question);
  persistSubmissions();
  refreshFileUnsavedDots();
}

function getActiveFileTab() {
  if (!fileTabs) return null;
  return fileTabs.querySelector('.file-tab.active');
}

function getFilenameForIndex(idx) {
  if (!fileList || idx < 0 || idx >= fileList.length) return null;
  return fileList[idx].filename;
}

function showFileUnsavedDot(idx) {
  const name = getFilenameForIndex(idx);
  if (!name) return;
  unsavedFiles[name] = true;
  const tab = fileTabs ? fileTabs.querySelectorAll('.file-tab')[idx] : null;
  if (tab) {
    const dot = tab.querySelector('.bi-dot');
    if (dot) dot.classList.add('d-unsaved');
  }
}

function hideFileUnsavedDot() {
  const name = getFilenameForIndex(activeFileIndex);
  if (!name) return;
  delete unsavedFiles[name];
  const tab = fileTabs ? fileTabs.querySelectorAll('.file-tab')[activeFileIndex] : null;
  if (tab) {
    const dot = tab.querySelector('.bi-dot');
    if (dot) dot.classList.remove('d-unsaved');
  }
}

function hideAllUnsavedDots() {
  unsavedFiles = {};
  if (!fileTabs) return;
  fileTabs.querySelectorAll('.file-tab .bi-dot').forEach((d) => d.classList.remove('d-unsaved'));
}

function refreshFileUnsavedDots() {
  if (!fileTabs) return;
  fileTabs.querySelectorAll('.file-tab').forEach((tab, idx) => {
    const name = getFilenameForIndex(idx);
    const dot = tab.querySelector('.bi-dot');
    if (!dot || !name) return;
    dot.classList.toggle('d-unsaved', !!unsavedFiles[name]);
  });
}

function showNotesUnsavedDot() {
  const el = document.getElementById('notesUnsavedDot');
  if (el) el.classList.add('d-unsaved');
}

function hideNotesUnsavedDot() {
  const el = document.getElementById('notesUnsavedDot');
  if (el) el.classList.remove('d-unsaved');
}

/* ─── Auth ─── */
let authMode = 'signin';
const authOverlay = document.getElementById('authOverlay');
let authModal, authModalTitle, authEmail, authPassword, authActionBtn, authModalCloseBtn;
let authError, authToggleLink, authToggleText, authGoogleBtn;
const authCloseLink = null;
const authShowBtn = document.getElementById('authShowBtn');
const authLoginBtn = document.getElementById('authLoginBtn');
const authUserMenu = document.getElementById('authUserMenu');
const authAvatar = document.getElementById('authAvatar');
const authUserName = document.getElementById('authUserName');
const authUserEmail = document.getElementById('authUserEmail');
const authLogoutLink = document.getElementById('authLogoutLink');
const resetProfileLink = document.getElementById('resetProfileLink');

function injectAuthModal() {
  // Adopt an existing #authModal if one is already in the DOM, otherwise create
  // it. Never create a second one — the tamper guard relies on a single element.
  let el = document.getElementById('authModal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authModal';
    el.className = 'auth-modal-backdrop';
    el.innerHTML = `
    <div class="auth-modal">
      <h3 id="authModalTitle">Sign In</h3>
      <div id="authError" class="auth-error"></div>
      <button id="authGoogleBtn" class="btn btn-outline-secondary w-100" style="margin-bottom:0.75rem">
        <i class="bi bi-google"></i> Sign in with Google
      </button>
      <hr style="margin:0.5rem 0;color:var(--border-color)">
      <input id="authEmail" type="email" class="form-control" placeholder="Email">
      <input id="authPassword" type="password" class="form-control" placeholder="Password">
      <button id="authActionBtn" class="btn btn-primary w-100">Sign In</button>
      <div class="auth-toggle" style="margin-top:0.5rem">
        <span id="authToggleText">Don't have an account? </span>
        <a id="authToggleLink">Sign Up</a>
      </div>
    </div>`;
  }
  // Keep it a direct child of <body> so the body-level "content behind is
  // non-interactive" lock never disables the modal itself.
  if (el.parentElement !== document.body) document.body.appendChild(el);
  // Ensure a close button exists (the modal may be an adopted element).
  if (!document.getElementById('authModalClose')) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.id = 'authModalClose';
    closeBtn.className = 'auth-modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    const box = el.querySelector('.auth-modal') || el;
    box.insertBefore(closeBtn, box.firstChild);
  }
  authModal = el;
  authModalCloseBtn = document.getElementById('authModalClose');
  authModalTitle = document.getElementById('authModalTitle');
  authEmail = document.getElementById('authEmail');
  authPassword = document.getElementById('authPassword');
  authActionBtn = document.getElementById('authActionBtn');
  authError = document.getElementById('authError');
  authToggleLink = document.getElementById('authToggleLink');
  authToggleText = document.getElementById('authToggleText');
  authGoogleBtn = document.getElementById('authGoogleBtn');

  // Attach listeners once (an adopted element may already have them).
  if (!el._listenersAttached) {
    el._listenersAttached = true;
    if (authGoogleBtn) authGoogleBtn.addEventListener('click', () => {
      signInWithGoogle().then(() => { window.location.reload(); }).catch((err) => {
        showAuthError(err.message || 'Google sign-in failed.');
      });
    });
    if (authActionBtn) authActionBtn.addEventListener('click', handleAuthAction);
    if (authPassword) authPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthAction(); });
    if (authToggleLink) authToggleLink.addEventListener('click', toggleAuthMode);
    if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', () => closeAuthModal());
    el.addEventListener('click', (e) => { if (e.target === el && el._backdropClose) closeAuthModal(); });
  }

  // Watch this element for attribute tampering (e.g. display:none) even if the
  // polling guard is cleared from the console.
  if (!el._tamperObserver) {
    el._tamperObserver = new MutationObserver(() => {
      if (window._authModalOpen && authModalTampered()) forceAuthModalVisible();
    });
    el._tamperObserver.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  }

  // Watch for removal. While the modal is meant to be open, restore it (and its
  // visible state) immediately if it is deleted via devtools.
  if (!window._authModalObserver) {
    window._authModalObserver = new MutationObserver(() => {
      if (window._authModalOpen && !document.getElementById('authModal')) {
        forceAuthModalVisible();
      }
    });
    window._authModalObserver.observe(document.body, { childList: true });
  }
}
function toggleAuthMode() {
  injectAuthModal();
  openAuthModal(authMode === 'signin' ? 'signup' : 'signin');
}
/* ─── Resume (track last problem URL) ─── */
function maybeSaveProblemUrl(url) {
  if (url && url.includes('/courses/')) {
    localStorage.setItem('lastProblemUrl', url);
    if (activeQuestionId) localStorage.setItem('lastProblemTab', getSavedTab(activeQuestionId) || '');
  }
}

(function() {
  maybeSaveProblemUrl(window.location.href);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) maybeSaveProblemUrl(window.location.href);
  });

  window.addEventListener('popstate', () => {
    maybeSaveProblemUrl(window.location.href);
  });
})();

function getCurrentQuestion() {
  return questions.find((q) => q.id === activeQuestionId);
}

function updateAuthGates() {
  const authed = isAuthenticated();
  document.querySelectorAll('.gated-overlay').forEach((overlay) => {
    const gatedDiv = overlay.closest('[style*="position: relative"]');
    const blurInner = gatedDiv ? gatedDiv.querySelector('.auth-gated') : null;
    if (!gatedDiv || !blurInner) return;
    blurInner.classList.toggle('content-blurred-force', !authed);
    overlay.classList.toggle('show', !authed);
  });
}

function updateAuthBlur() {
  const ready = typeof isAuthReady === 'undefined' ? true : isAuthReady();
  if (!ready) return;
  updateAuthGates();
}

function setupAuth() {
  if (typeof onAuthChange === 'undefined') return;

  // One-time button listeners
  if (authLoginBtn) authLoginBtn.addEventListener('click', () => openAuthModal('signin'));
  if (authLogoutLink) authLogoutLink.addEventListener('click', () => {
    // Flush pending notes/code to the cloud before clearing local storage so a
    // quick "type then sign out" doesn't lose unsynced edits.
    if (typeof saveCurrentNotes === 'function') saveCurrentNotes();
    if (typeof saveCurrentCode === 'function') saveCurrentCode();
    var flush = (typeof window.__cloudSyncNow === 'function') ? window.__cloudSyncNow() : Promise.resolve();
    flush.finally(function() {
      localStorage.removeItem('pyjamacode-submissions');
      localStorage.removeItem('pyjamacode-notes');
      localStorage.removeItem('pyjamacode-bookmarks');
      localStorage.removeItem('pyjamacode-quiz-results');
      localStorage.removeItem('pyjamacode-free-used');
      localStorage.removeItem('pyjamacode-tabs');
      localStorage.removeItem('lastProblemUrl');
      localStorage.removeItem('lastProblemTab');
      localStorage.removeItem('pyjamacode-cloud-initialized');
      localStorage.removeItem('pyjamacode-local-version');
      localStorage.removeItem('pyjamacode-synced-version');
      clearDirtyIds();
      try { localStorage.removeItem('pyjamacode-session-id'); } catch (e) {}
      signOut().finally(function() { location.reload(); });
    });
  });
  var resetDialog = document.getElementById('resetConfirmModal');
  var resetCodeEl = document.getElementById('resetConfirmCode');
  var resetInput = document.getElementById('resetConfirmInput');
  var resetConfirmYes = document.getElementById('resetConfirmYes');
  var resetConfirmNo = document.getElementById('resetConfirmNo');

  function generateResetCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function clearLocalProfile() {
    localStorage.removeItem('pyjamacode-submissions');
    localStorage.removeItem('pyjamacode-notes');
    localStorage.removeItem('pyjamacode-bookmarks');
    localStorage.removeItem('pyjamacode-quiz-results');
    localStorage.removeItem('pyjamacode-free-used');
    localStorage.removeItem('pyjamacode-tabs');
    localStorage.removeItem('lastProblemUrl');
    localStorage.removeItem('lastProblemTab');
    localStorage.removeItem('pyjamacode-cloud-initialized');
    localStorage.removeItem('pyjamacode-local-version');
    localStorage.removeItem('pyjamacode-synced-version');
    clearDirtyIds();
    try { localStorage.removeItem('pyjamacode-session-id'); } catch (e) {}
    try { localStorage.removeItem('pyjamacode-theme'); } catch (e) {}
  }

  if (resetProfileLink) {
    resetProfileLink.addEventListener('click', function() {
      if (!resetDialog || !resetCodeEl || !resetInput || !resetConfirmYes) return;
      var code = generateResetCode();
      resetCodeEl.textContent = code;
      resetInput.value = '';
      resetConfirmYes.disabled = true;
      resetDialog.showModal();
    });
  }
  if (resetConfirmNo) {
    resetConfirmNo.addEventListener('click', function() {
      if (resetDialog) resetDialog.close();
    });
  }
  if (resetDialog) {
    resetDialog.addEventListener('close', function() {
      if (resetInput) resetInput.value = '';
    });
  }
  if (resetInput) {
    resetInput.addEventListener('input', function() {
      if (!resetConfirmYes || !resetCodeEl) return;
      resetConfirmYes.disabled = resetInput.value !== resetCodeEl.textContent;
    });
  }
  if (resetConfirmYes) {
    resetConfirmYes.addEventListener('click', function() {
      if (resetConfirmYes.disabled) return;
      if (resetDialog) resetDialog.close();
      var uid = null;
      try {
        if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.auth().currentUser) {
          uid = firebase.auth().currentUser.uid;
        }
      } catch (e) {}
      if (uid) {
        // Signal other sessions via Firestore, then delete everything
        window._wipingUid = uid;
        firebase.firestore().collection('users').doc(uid).collection('meta').doc('profile').set({
          _wipedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).then(function() {
          return deleteUserData(uid);
        }).then(function() {
          clearLocalProfile();
          window.location.href = '/dashboard/';
        }).catch(function(e) {
          console.error('Failed to delete cloud data:', e);
          clearLocalProfile();
          window.location.href = '/dashboard/';
        });
      } else {
        clearLocalProfile();
        window.location.href = '/dashboard/';
      }
    });
  }
  // Cross-session wipe detection — other tabs clear data when this tab wipes
  window.addEventListener('storage', function(e) {
    if (e.key === 'pyjamacode-wiped-at' && e.newValue) {
      clearLocalProfile();
      window.location.href = '/dashboard/';
    }
  });
  if (authGoogleBtn) authGoogleBtn.addEventListener('click', () => {
    signInWithGoogle().then(() => { window.location.reload(); }).catch((err) => {
      showAuthError(err.message || 'Google sign-in failed.');
    });
  });

  onAuthChange((user) => {
    const isAuthed = user !== null;

    // Clear force blur and reset view count on login
    if (isAuthed) {
      if (questionContentEl) questionContentEl.classList.remove('content-blurred-force');
      if (editorArea) editorArea.classList.remove('content-blurred-force');
      if (authCloseLink) authCloseLink.style.display = '';
      if (authModal) authModal._backdropClose = false;
      // Dismiss the prompt and release the content lock once signed in.
      if (typeof closeAuthModal === 'function') closeAuthModal();
      if (typeof hideNotesAuthPrompt === 'function') hideNotesAuthPrompt();
      if (typeof clearFreeRuns === 'function') clearFreeRuns();
      localStorage.removeItem('authForced');
      localStorage.removeItem('pyjamacode-free-used');

      // Redirect to dashboard after login if on landing page
      if (isAuthed && (window.location.pathname === '/' || window.location.pathname === '')) {
        window.location.replace('/dashboard/');
        return;
      }
    }

    if (authLoginBtn) authLoginBtn.classList.toggle('d-none', isAuthed);
    if (authUserMenu) authUserMenu.classList.toggle('d-none', !isAuthed);
    if (user) {
      const name = user.displayName || user.email || '';
      const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();
      if (authUserName) authUserName.textContent = name;
      if (authAvatar) {
        if (user.photoURL) {
          authAvatar.innerHTML = '<img src="' + user.photoURL + '" alt="">';
        } else {
          authAvatar.textContent = initial;
        }
      }
      if (authUserEmail) authUserEmail.textContent = user.email;
    }

    updateAuthBlur();
    updateSyncIndicator();
  });

  // Auth overlay button → open modal
  if (authShowBtn) authShowBtn.addEventListener('click', () => openAuthModal('signin'));

  // Action button
  if (authActionBtn) authActionBtn.addEventListener('click', handleAuthAction);

  // Enter key in password field
  if (authPassword) authPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthAction(); });
}

function authModalClosable() {
  return !!(window.__APP_CONFIG__ && window.__APP_CONFIG__.allowAuthModalClose === true);
}

function openAuthModal(mode) {
  injectAuthModal();
  authMode = mode;
  if (authModalTitle) authModalTitle.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
  if (authActionBtn) authActionBtn.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
  if (authToggleText) authToggleText.textContent = mode === 'signin' ? "Don't have an account? " : 'Already have an account? ';
  if (authToggleLink) authToggleLink.textContent = mode === 'signin' ? 'Sign Up' : 'Sign In';
  if (authError) authError.style.display = 'none';
  if (authEmail) authEmail.value = '';
  if (authPassword) authPassword.value = '';
  if (authModal) authModal.classList.add('show');
  if (authEmail) setTimeout(() => authEmail.focus(), 100);
  // Lock the modal — prevent all dismissals and keep it on screen.
  if (authModal) {
    // Dismissable only when configured; otherwise the modal is forced on screen.
    authModal._backdropClose = authModalClosable();
    if (authModalCloseBtn) authModalCloseBtn.classList.toggle('d-none', !authModalClosable());
    setAuthModalOpen(true);
  }
}
window.openAuthModal = openAuthModal;

// ─── Auth modal tamper guard ───
// The sign-in/sign-up prompt must stay on screen. While it is open we (1) force
// it back into view if it is deleted or hidden via devtools, and (2) make the
// page behind it non-interactive so the app can't be used without signing in.
function setAuthModalOpen(open) {
  window._authModalOpen = !!open;
  if (!document.body) return;
  if (open) {
    document.body.classList.add('auth-modal-open');
    startAuthModalGuard();
  } else {
    document.body.classList.remove('auth-modal-open');
    stopAuthModalGuard();
    if (authModal) {
      ['display', 'visibility', 'opacity', 'pointer-events'].forEach((p) => authModal.style.removeProperty(p));
    }
  }
}

function forceAuthModalVisible() {
  if (!authModal || !document.body.contains(authModal)) injectAuthModal();
  if (!authModal) return;
  authModal.classList.add('show');
  // Inline !important beats a devtools-injected stylesheet that tries to hide it.
  authModal.style.setProperty('display', 'flex', 'important');
  authModal.style.setProperty('visibility', 'visible', 'important');
  authModal.style.setProperty('opacity', '1', 'important');
  authModal.style.setProperty('pointer-events', 'auto', 'important');
}

function authModalTampered() {
  if (!authModal || !document.body.contains(authModal)) return true;
  const cs = window.getComputedStyle(authModal);
  return cs.display === 'none' ||
    cs.visibility === 'hidden' ||
    parseFloat(cs.opacity) === 0 ||
    cs.pointerEvents === 'none';
}

function startAuthModalGuard() {
  if (window._authModalGuard) return;
  window._authModalGuard = setInterval(() => {
    if (!window._authModalOpen || isAuthenticated()) {
      stopAuthModalGuard();
      return;
    }
    if (authModalTampered()) forceAuthModalVisible();
  }, 200);
}

function stopAuthModalGuard() {
  if (window._authModalGuard) {
    clearInterval(window._authModalGuard);
    window._authModalGuard = null;
  }
}

function clearAuthGuard() {
  setAuthModalOpen(false);
}

function closeAuthModal() {
  if (authModal) authModal.classList.remove('show');
  if (authError) authError.style.display = 'none';
  setAuthModalOpen(false);
}

function handleAuthAction() {
  const email = authEmail ? authEmail.value.trim() : '';
  const password = authPassword ? authPassword.value : '';

  if (!email || !password) {
    showAuthError('Please enter email and password.');
    return;
  }

  if (authActionBtn) authActionBtn.disabled = true;

  const promise = authMode === 'signin' ? signIn(email, password) : signUp(email, password);

  promise
    .then(() => { closeAuthModal(); })
    .catch((err) => {
      let msg = err.message || 'An error occurred.';
      // Simplify common Firebase errors
      if (msg.includes('email-already-in-use')) msg = 'This email is already registered.';
      else if (msg.includes('wrong-password') || msg.includes('user-not-found')) msg = 'Invalid email or password.';
      else if (msg.includes('weak-password')) msg = 'Password should be at least 6 characters.';
      else if (msg.includes('invalid-email')) msg = 'Please enter a valid email address.';
      showAuthError(msg);
    })
    .finally(() => { if (authActionBtn) authActionBtn.disabled = false; });
}

function showAuthError(msg) {
  if (authError) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }
}

/* ─── Cloud Sync ─── */

// Recursively delete all docs in a collection (client-side batch pattern)
function deleteCollection(db, collectionRef, batchSize) {
  batchSize = batchSize || 20;
  return collectionRef.limit(batchSize).get().then(function(snapshot) {
    if (snapshot.size === 0) return Promise.resolve();
    var batch = db.batch();
    snapshot.forEach(function(doc) { batch.delete(doc.ref); });
    return batch.commit().then(function() {
      return deleteCollection(db, collectionRef, batchSize);
    });
  });
}

function deleteUserData(uid) {
  var db = firebase.firestore();
  var promises = [];
  promises.push(deleteCollection(db, db.collection('users').doc(uid).collection('codes')));
  promises.push(deleteCollection(db, db.collection('users').doc(uid).collection('notes')));
  promises.push(deleteCollection(db, db.collection('users').doc(uid).collection('quizzes')));
  promises.push(db.collection('users').doc(uid).collection('sessions').doc('_active').delete());
  promises.push(db.collection('users').doc(uid).collection('meta').doc('profile').delete());
  return Promise.all(promises).then(function() {});
}

function initSync() {
  if (typeof firebase === 'undefined' || !firebase.apps.length) return;
  const db = firebase.firestore();
  let syncUid = null;

  // Build a status map from the in-memory submissions object
  function buildStatusMap() {
    const map = {};
    for (const id of Object.keys(submissions)) {
      const s = submissions[id];
      if (s.status && s.status !== 'Unattempted') map[id] = s.status;
    }
    return map;
  }

  // Push changed items individually to granular Firestore docs
  function pushChangedItems(ids) {
    if (!syncUid) return Promise.resolve();
    const batch = db.batch();

    // Meta doc: theme + tab + status map + per-problem tabs
    const metaRef = db.collection('users').doc(syncUid).collection('meta').doc('profile');
    batch.set(metaRef, {
      tab: new URL(window.location).searchParams.get('tab') || '',
      status: buildStatusMap(),
      tabs: buildTabsMap(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Write each changed submission as an individual code doc
    if (ids) {
      ids.forEach(function(id) {
        const sub = submissions[id];
        if (sub) {
          const codeDoc = {
            code: sub.code || '',
            files: sub.files || null,
            status: sub.status || 'Unattempted',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          batch.set(
            db.collection('users').doc(syncUid).collection('codes').doc(id),
            codeDoc
          );
        }
        // Write note for this ID if it exists. Kept independent of the code
        // doc: notes must sync even on chapters with no code submission.
        if (notes[id] && notes[id].trim()) {
          batch.set(
            db.collection('users').doc(syncUid).collection('notes').doc(id),
            { content: notes[id], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }
          );
        }
      });
    }

    // Write dirty quizzes
    for (var qid in _dirtyQuizzes) {
      if (quizResults[qid]) {
        batch.set(
          db.collection('users').doc(syncUid).collection('quizzes').doc(qid),
          { results: quizResults[qid], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }
        );
      } else {
        batch.delete(
          db.collection('users').doc(syncUid).collection('quizzes').doc(qid)
        );
      }
    }

    return batch.commit();
  }

  function startCloudListener(uid) {
    if (window._cloudUnsub) { window._cloudUnsub(); window._cloudUnsub = null; }
    // Listen to meta doc for real-time status/theme/tab updates
    window._cloudUnsub = db.collection('users').doc(uid).collection('meta').doc('profile').onSnapshot(function(snap) {
      if (window._isPushingLocally) return;
      if (!snap.exists) return;
      const data = snap.data();
      // Cross-browser wipe signal — another session reset the profile
      if (data._wipedAt && window._wipingUid !== uid) {
        clearLocalProfile();
        window.location.href = '/dashboard/';
        return;
      }
      let changed = false;
      if (data.status) {
        var statusChanged = false;
        for (const id of Object.keys(data.status)) {
          if (!submissions[id]) submissions[id] = {};
          if (submissions[id].status !== data.status[id]) {
            submissions[id].status = data.status[id];
            statusChanged = true;
          }
        }
        if (statusChanged) {
          persistSubmissions();
          changed = true;
        }
      }
      if (data.tabs) {
        var localTabs = {};
        try { localTabs = JSON.parse(localStorage.getItem('pyjamacode-tabs') || '{}'); } catch (e) { localTabs = {}; }
        var merged = false;
        for (var id in data.tabs) {
          if (data.tabs[id] && localTabs[id] !== data.tabs[id]) {
            localTabs[id] = data.tabs[id];
            merged = true;
          }
        }
        if (merged) {
          localStorage.setItem('pyjamacode-tabs', JSON.stringify(localTabs));
        }
      }
      if (changed) {
        refreshUI();
        setDirty(false);
      }
    });

    // Note: codes, notes, and quizzes listeners are intentionally removed.
    // Cloud sync only happens on explicit user action (sync button or Ctrl+S).
    // Cross-tab sync within the same browser uses the localStorage storage event.
  }

  function stopCloudListener() {
    if (window._cloudUnsub) { window._cloudUnsub(); window._cloudUnsub = null; }
  }

  function pullFromCloud(uid) {
    // After first sync, use localStorage only — don't pull from cloud on every load
    if (localStorage.getItem('pyjamacode-cloud-initialized')) return Promise.resolve();
    return db.collection('users').doc(uid).collection('meta').doc('profile').get().then(function(metaSnap) {
      if (metaSnap.exists) {
        const meta = metaSnap.data();
        if (meta.status) {
          for (const id of Object.keys(meta.status)) {
            if (!submissions[id]) submissions[id] = {};
            submissions[id].status = meta.status[id];
          }
          persistSubmissions();
        }
        if (meta.tabs) {
          try { localStorage.setItem('pyjamacode-tabs', JSON.stringify(meta.tabs)); } catch (e) {}
        }
        // Pull all code docs into local submissions
        return db.collection('users').doc(uid).collection('codes').get().then(function(codeSnap) {
          codeSnap.forEach(function(doc) {
            var data = doc.data();
            var id = doc.id;
            if (!submissions[id]) submissions[id] = {};
            if (data.code) submissions[id].code = data.code;
            if (data.files) submissions[id].files = data.files;
            if (data.status) submissions[id].status = data.status;
            if (data.output) submissions[id].output = data.output;
          });
          persistSubmissions();
          // Pull all notes docs
          return db.collection('users').doc(uid).collection('notes').get().then(function(noteSnap) {
            noteSnap.forEach(function(doc) {
              var data = doc.data();
              if (data.content) notes[doc.id] = data.content;
            });
            persistNotes();
            // Pull all quiz results
            return db.collection('users').doc(uid).collection('quizzes').get().then(function(quizSnap) {
              quizSnap.forEach(function(doc) {
                var data = doc.data();
                quizResults[doc.id] = data.results || {};
              });
              try { localStorage.setItem('pyjamacode-quiz-results', JSON.stringify(quizResults)); } catch (e) {}
              localStorage.setItem('pyjamacode-cloud-initialized', '1');
              setSyncedVersion();
              return Promise.resolve();
            });
          });
        });
      }
      // No data at all — mark initialized so we don't pull again
      localStorage.setItem('pyjamacode-cloud-initialized', '1');
      setSyncedVersion();
      return Promise.resolve();
    });
  }

  function pushAllToCloud() {
    if (!syncUid) return Promise.resolve();
    for (var qid in quizResults) _dirtyQuizzes[qid] = true;
    window._isPushingLocally = true;
    updateSyncIndicator();
    return pushChangedItems(Object.keys(submissions).concat(Object.keys(notes))).then(function() {
      _dirtySubmissions = {};
      _dirtyNotes = {};
      _dirtyQuizzes = {};
      clearDirtyIds();
      localStorage.setItem('pyjamacode-cloud-initialized', '1');
      setSyncedVersion();
      window._isPushingLocally = false;
      updateSyncIndicator();
    }).catch(function() { window._isPushingLocally = false; updateSyncIndicator(); });
  }

  function refreshUI() {
    loadSubmissions();
    loadNotes();
    const _q = questions.find(function(q) { return q.id === activeQuestionId; });
    if (activeQuestionId && questionContentEl && (!_q || !_q.isIntro)) selectQuestion(activeQuestionId);
    else renderQuestionList(questionSearchEl ? questionSearchEl.value : '');
  }

  // ─── Configurable session enforcement ───
  var localSessionId = null;
  var sessionUnsub = null;

  function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function registerSession(uid) {
    var maxSessions = (window.__APP_CONFIG__ && window.__APP_CONFIG__.maxSessions) || 1;
    if (maxSessions <= 0) return;

    localSessionId = localStorage.getItem('pyjamacode-session-id');
    if (!localSessionId) {
      localSessionId = generateSessionId();
      try { localStorage.setItem('pyjamacode-session-id', localSessionId); } catch (e) {}
    }

    var sessCol = db.collection('users').doc(uid).collection('sessions');
    var sessDoc = sessCol.doc('_active');

    // Migrate old per-doc sessions to the new map format
    sessDoc.get().then(function(docSnap) {
      var needsMigration = true;
      if (docSnap.exists) {
        var d = docSnap.data();
        // If _active has a 'sessions' map, it's already the new format
        if (d && d.sessions && typeof d.sessions === 'object' && !Array.isArray(d.sessions)) {
          needsMigration = false;
        }
      }
      if (needsMigration) {
        // Read all old-format session docs and merge into the map
        return sessCol.get().then(function(colSnap) {
          var map = {};
          colSnap.forEach(function(doc) {
            if (doc.id === '_active') return;
            var data = doc.data();
            if (data.updatedAt) {
              map[doc.id] = data.updatedAt;
            }
            doc.ref.delete();
          });
          // Write the merged map (including the old _active doc if it existed but had wrong format)
          return sessDoc.set({ sessions: map }, { merge: true });
        });
      }
    }).then(function() {
      // Now add our session to the map
      return sessDoc.set({ sessions: { [localSessionId]: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true });
    }).then(function() {
      // Register the listener AFTER migration and our session addition
      if (sessionUnsub) sessionUnsub();
      sessionUnsub = sessDoc.onSnapshot(function(snap) {
        if (!snap.exists || window._isPushingLocally) return;
        var data = snap.data() || {};
        var sessions = data.sessions || {};
        var active = Object.keys(sessions).map(function(id) {
          var ts = sessions[id];
          return { id: id, ts: ts && ts.toMillis ? ts.toMillis() : (ts || 0) };
        });
        active.sort(function(a, b) { return a.ts - b.ts; });
        // If our session is not in the map, we were evicted
        if (active.every(function(s) { return s.id !== localSessionId; })) {
          signOut().then(function() { window.location.href = '/?session=expired'; })
            .catch(function() { window.location.href = '/?session=expired'; });
          return;
        }
        // Evict oldest beyond the limit (won't be ours — we just checked)
        // This also handles dynamic limit changes (if maxSessions was reduced)
        while (active.length > maxSessions) {
          var oldest = active.shift();
          sessDoc.set({ sessions: { [oldest.id]: firebase.firestore.FieldValue.delete() } }, { merge: true });
        }
      });
    });

  }

  function unregisterSession() {
    if (sessionUnsub) { sessionUnsub(); sessionUnsub = null; }
    if (syncUid && localSessionId) {
      db.collection('users').doc(syncUid).collection('sessions').doc('_active').set(
        { sessions: { [localSessionId]: firebase.firestore.FieldValue.delete() } },
        { merge: true }
      );
    }
    try { localStorage.removeItem('pyjamacode-session-id'); } catch (e) {}
    localSessionId = null;
  }

  // Listen for auth changes
  onAuthChange(function(user) {
    if (user) {
      syncUid = user.uid;
      pullFromCloud(user.uid).then(function() {
        refreshUI();
        startCloudListener(user.uid);
        registerSession(user.uid);
        setDirty(false);
        updateSyncIndicator();
      }).catch(function() {
        pushAllToCloud().then(function() {
          startCloudListener(user.uid);
          registerSession(user.uid);
          setDirty(false);
        });
      });
    } else {
      syncUid = null;
      stopCloudListener();
      unregisterSession();
      setDirty(false);
      updateSyncIndicator();
    }
  });

  var dirty = false;

  function setDirty(v) {
    if (!syncUid) return;
    dirty = v;
    var base = document.title.replace(/^\* /, '');
    document.title = v ? '* ' + base : base;
  }

  function doSync() {
    if (!syncUid) return Promise.resolve();
    saveCurrentCode();
    saveCurrentNotes();
    var changedIds = Object.keys(_dirtySubmissions);
    // Include every locally-held note so the sync always covers notes, even
    // if the dirty flag was missed (e.g. notes restored from local storage).
    for (var nid in notes) {
      if (changedIds.indexOf(nid) === -1) changedIds.push(nid);
    }
    for (var nid2 in _dirtyNotes) {
      if (changedIds.indexOf(nid2) === -1) changedIds.push(nid2);
    }
    window._isPushingLocally = true;
    updateSyncIndicator();
    return pushChangedItems(changedIds).then(function() {
      _dirtySubmissions = {};
      _dirtyNotes = {};
      _dirtyQuizzes = {};
      clearDirtyIds();
      localStorage.setItem('pyjamacode-cloud-initialized', '1');
      setSyncedVersion();
      window._isPushingLocally = false;
      updateSyncIndicator();
      setDirty(false);
    }).catch(function(err) {
      console.error('Cloud sync failed:', err);
      window._isPushingLocally = false;
      updateSyncIndicator();
    });
  }

  // Expose the sync so sign-out can flush pending notes/code before the page
  // unloads and wipes local storage (otherwise the push can be cancelled).
  window.__cloudSyncNow = function() {
    return doSync();
  };

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      doSync();
    }
  });

  document.addEventListener('cloud-sync-requested', doSync);

  var origPersistSubmissions = persistSubmissions;
  persistSubmissions = function() {
    origPersistSubmissions();
  };

  var origPersistNotes = persistNotes;
  persistNotes = function() {
    origPersistNotes();
  };
}

// Inline responsive breakpoint — applied before any render
(function() {
  var bp = window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint;
  if (bp && typeof bp === 'number') {
    var style = document.createElement('style');
    style.textContent =
      '@media (max-width:' + bp + 'px){.console-resizer{display:none!important}#resizerCasesCase{display:none!important}#questionPane{width:100%!important;flex:1}#sidebarPane{position:fixed;top:56px;left:0;bottom:0;z-index:1040;width:320px!important;max-width:85vw;background:var(--bs-body-bg);border-right:1px solid var(--border-color);transform:translateX(-100%);transition:transform 0.25s ease;overflow-y:auto;box-shadow:4px 0 12px rgba(0,0,0,0.15)}#sidebarPane.sidebar-open{transform:translateX(0)}#sidebarPane .sidebar-close{display:flex!important}.sidebar-backdrop{display:none;position:fixed;inset:0;z-index:1039;background:rgba(0,0,0,0.4)}.sidebar-backdrop.show{display:block}#editorPane{position:static;transform:none;width:100%!important;flex:1;display:flex!important;flex-direction:column}#statusText{text-align:center}.editor-backdrop{display:none;position:fixed;inset:0;z-index:1039;background:rgba(0,0,0,0.4)}.editor-backdrop.show{display:block}.notes-area{z-index:1030!important}.notes-widget{z-index:1032!important}}' +
      // Tablet range: the right reading pane is hidden; reading merges into the center tabs.
      '@media (min-width:768px) and (max-width:' + bp + 'px){#readingPane{display:none!important}.center-tab.reading-merged{display:block}.reading-merged{display:block}}' +
      // Phones: stack the reading pane below the center pane so the user
      // scrolls naturally — center content first, then reading.
      '@media (max-width:767px){#questionPane{flex:none!important;height:auto!important}.question-pane-body{display:block;overflow:visible}#readingPane{min-width:auto!important;flex:none!important;height:auto!important}#readingPane .pane-body{overflow:visible}}';
    document.head.appendChild(style);
  }
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
