(() => {
  // <stdin>
  var difficultyClasses = {
    easy: "text-bg-success",
    medium: "text-bg-warning",
    hard: "text-bg-danger"
  };
  var languageModes = {
    c: "text/x-csrc",
    cpp: "text/x-c++src",
    cs: "text/x-csharp",
    python: "python",
    py: "python",
    assembly: "gas",
    asm: "gas",
    gas: "gas",
    s: "gas",
    ld: "gas",
    bash: "text/x-sh",
    sh: "text/x-sh",
    shell: "text/x-sh",
    makefile: "text/x-sh",
    mk: "text/x-sh",
    text: "text/plain",
    plaintext: "text/plain"
  };
  function langToMode(lang) {
    if (!lang) return "text/plain";
    return languageModes[String(lang).toLowerCase()] || "text/plain";
  }
  var languageLabels = {
    c: "C",
    cpp: "C++",
    cs: "C#",
    python: "Python",
    py: "Python",
    assembly: "Assembly",
    asm: "Assembly",
    gas: "Assembly",
    s: "Assembly",
    ld: "Linker Script",
    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    makefile: "Makefile",
    mk: "Makefile",
    text: "Text",
    plaintext: "Text"
  };
  function langToLabel(lang) {
    if (!lang) return "";
    return languageLabels[String(lang).toLowerCase()] || String(lang).toUpperCase();
  }
  var htmlEl = document.documentElement;
  var problemDataEl = document.getElementById("problem-data");
  var activeProblemInput = document.getElementById("active-problem-id");
  var questionListEl = document.getElementById("questionList");
  var questionSearchEl = document.getElementById("questionSearch");
  var questionContentEl = document.getElementById("questionContent");
  var articleContentEl = document.getElementById("articleContent");
  var readingTabContentEl = document.getElementById("readingTabContent");
  var quizContentEl = document.getElementById("quizContent");
  var tabChallenge = document.getElementById("tabChallenge");
  var tabArticle = document.getElementById("tabArticle");
  var tabReading = document.getElementById("tabReading");
  var tabQuiz = document.getElementById("tabQuiz");
  var difficultyBadgeEl = document.getElementById("difficultyBadge");
  var codeEditorEl = document.getElementById("codeEditor");
  var codeEditorWrapper = document.getElementById("codeEditorWrapper");
  var languageLabelEl = document.getElementById("languageLabel");
  var consoleOutputEl = document.getElementById("consoleOutput");
  var statusTextEl = document.getElementById("statusText");
  var runBtn = document.getElementById("runBtn");
  var submitBtn = document.getElementById("submitBtn");
  var resetBtn = document.getElementById("resetBtn");
  var resetAllBtn = document.getElementById("resetAllBtn");
  var fileTabs = document.getElementById("fileTabs");
  var clearConsoleBtn = document.getElementById("clearConsole");
  var bookmarkBtn = document.getElementById("bookmarkBtn");
  var sidebarPane = document.getElementById("sidebarPane");
  var editorPane = document.getElementById("editorPane");
  var questionPane = document.getElementById("questionPane");
  var consoleArea = document.getElementById("consoleArea");
  var editorArea = document.getElementById("editorArea");
  var resizerCasesCase = document.getElementById("resizerCasesCase");
  var resizerCaseWorkspace = document.getElementById("resizerCaseWorkspace");
  var resizerEditorConsole = document.getElementById("resizerEditorConsole");
  var questionPaneBody = document.getElementById("questionPaneBody");
  var notesArea = document.getElementById("notesArea");
  var notesEditorEl = document.getElementById("notesEditor");
  var notesEditorWrapper = document.getElementById("notesEditorWrapper");
  var notesPreviewEl = document.getElementById("notesPreview");
  var notesModeBtn = document.getElementById("notesModeBtn");
  var exportNotesMenuItem = document.getElementById("exportNotesMenuItem");
  var exportPdfMenuItem = document.getElementById("exportPdfMenuItem");
  var notesMinimizeBtn = document.getElementById("notesMinimizeBtn");
  var notesMaximizeBtn = document.getElementById("notesMaximizeBtn");
  var notesRestoreBtn = document.getElementById("notesRestoreBtn");
  var resizerQuestionNotes = document.getElementById("resizerQuestionNotes");
  var SUBMISSIONS_STORAGE_KEY = "pyjamacode-submissions";
  var NOTES_STORAGE_KEY = "pyjamacode-notes";
  var BOOKMARKS_STORAGE_KEY = "pyjamacode-bookmarks";
  var questions = [];
  var activeQuestionId = null;
  var submissions = {};
  var notes = {};
  var bookmarks = {};
  var unsavedFiles = {};
  var quizResults = {};
  function requireAuth() {
    if (typeof isAuthenticated === "function" && isAuthenticated()) return true;
    if (typeof openAuthModal === "function") openAuthModal("signin");
    return false;
  }
  var FREE_RUNS_LIMIT = 3;
  function freeRunsKey(id) {
    return "pyjamacode-free-runs-" + id;
  }
  function freeRunsUsed(id) {
    try {
      return parseInt(localStorage.getItem(freeRunsKey(id)) || "0", 10) || 0;
    } catch (e) {
      return 0;
    }
  }
  function requireAuthForRun() {
    if (typeof isAuthenticated === "function" && isAuthenticated()) return true;
    const q = questions.find((x) => x.id === activeQuestionId);
    if (q && q.free_runs === true) {
      const used = freeRunsUsed(activeQuestionId);
      if (used < FREE_RUNS_LIMIT) {
        try {
          localStorage.setItem(freeRunsKey(activeQuestionId), String(used + 1));
        } catch (e) {
        }
        return true;
      }
    }
    if (typeof openAuthModal === "function") openAuthModal("signin");
    return false;
  }
  function clearFreeRuns() {
    try {
      Object.keys(localStorage).filter((k) => k.indexOf("pyjamacode-free-runs-") === 0).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
    }
  }
  var codeMirror = null;
  var notesCodeMirror = null;
  var isSettingValue = false;
  var isSettingNotesValue = false;
  var notesEditorPopulated = false;
  var notesPreviewMode = true;
  var activeFileIndex = 0;
  var fileList = [];
  var notesSavedHeight = null;
  var notesViewState = "normal";
  var notesWidget = null;
  var treeExpanded = {};
  var expandedGroup = null;
  var _groupsInitialized = false;
  var courseGroups = [];
  var _dirtySubmissions = {};
  var _dirtyNotes = {};
  var _dirtyQuizzes = {};
  function getDirtyIds() {
    try {
      return JSON.parse(localStorage.getItem("pyjamacode-dirty-ids") || "[]");
    } catch (e) {
      return [];
    }
  }
  function addDirtyId(id) {
    var ids = getDirtyIds();
    if (ids.indexOf(id) === -1) ids.push(id);
    try {
      localStorage.setItem("pyjamacode-dirty-ids", JSON.stringify(ids));
    } catch (e) {
    }
  }
  function clearDirtyIds() {
    try {
      localStorage.removeItem("pyjamacode-dirty-ids");
    } catch (e) {
    }
  }
  function bumpLocalVersion() {
    try {
      var cur = localStorage.getItem("pyjamacode-local-version");
      var v = (cur ? parseInt(cur, 10) : 0) + 1;
      localStorage.setItem("pyjamacode-local-version", String(v));
    } catch (e) {
    }
  }
  function setSyncedVersion() {
    try {
      var lv = localStorage.getItem("pyjamacode-local-version");
      localStorage.setItem("pyjamacode-synced-version", lv || "0");
    } catch (e) {
    }
  }
  function hasDirtyData() {
    if (Object.keys(_dirtySubmissions).length > 0 || Object.keys(_dirtyNotes).length > 0 || Object.keys(_dirtyQuizzes).length > 0) return true;
    try {
      return localStorage.getItem("pyjamacode-local-version") !== localStorage.getItem("pyjamacode-synced-version");
    } catch (e) {
      return false;
    }
  }
  function updateSyncIndicator() {
    var authed = typeof isAuthenticated === "function" && isAuthenticated();
    var dot = document.getElementById("syncDot");
    var btn = document.getElementById("syncBtn");
    var el = document.getElementById("syncIndicator");
    var label = document.getElementById("syncLabel");
    var btnF = document.getElementById("syncBtnFooter");
    var elF = document.getElementById("syncIndicatorFooter");
    var labelF = document.getElementById("syncLabelFooter");
    if (!btn || !el || !label) return;
    if (!authed) {
      btn.classList.add("d-none");
      if (btnF) btnF.classList.add("d-none");
      if (dot) dot.style.display = "none";
      return;
    }
    btn.classList.remove("d-none");
    if (btnF) btnF.classList.remove("d-none");
    if (dot) dot.style.display = "";
    var icon = el.querySelector("i");
    var iconF = elF ? elF.querySelector("i") : null;
    if (!icon) return;
    btn.className = "sync-dropdown-item";
    if (btnF) btnF.className = "sync-btn-footer";
    if (dot) dot.className = "sync-dot";
    var stateClass, stateIcon, stateLabel, stateTitle;
    if (window._isPushingLocally) {
      stateClass = "syncing";
      stateIcon = "bi bi-arrow-repeat";
      stateLabel = "Sync to cloud";
      stateTitle = "Syncing...";
    } else if (hasDirtyData()) {
      stateClass = "dirty";
      stateIcon = "bi bi-cloud-arrow-up";
      stateLabel = "Sync to cloud";
      stateTitle = "Unsaved changes \u2014 click to sync";
    } else {
      stateClass = "synced";
      stateIcon = "bi bi-cloud-check";
      stateLabel = "Synced to cloud";
      stateTitle = "In sync";
    }
    icon.className = stateIcon;
    btn.classList.add(stateClass);
    btn.title = stateTitle;
    label.textContent = stateLabel;
    if (iconF) iconF.className = stateIcon;
    if (btnF) {
      btnF.classList.add(stateClass);
      btnF.title = stateTitle;
    }
    if (labelF) labelF.textContent = stateLabel;
    if (dot) dot.classList.add(stateClass);
  }
  document.addEventListener("click", function(e) {
    var btn = e.target.closest("#syncBtn") || e.target.closest("#syncBtnFooter");
    if (!btn || btn.classList.contains("d-none") || !hasDirtyData() || window._isPushingLocally) return;
    var listEl = document.getElementById("syncChangesList");
    var dialog = document.getElementById("syncConfirmModal");
    var confirmBtn = document.getElementById("syncConfirmYes");
    if (!listEl || !dialog || !confirmBtn) return;
    var dirtyIds = getDirtyIds();
    var seen = {};
    var items = [];
    dirtyIds.forEach(function(id) {
      if (seen[id]) return;
      seen[id] = true;
      var q = questions.find(function(q2) {
        return q2.id === id;
      });
      var title = q ? q.title : id;
      items.push('<div><span class="text-in-progress">\u2714</span> ' + escapeHtml(title) + "</div>");
    });
    listEl.innerHTML = items.length ? items.join("") : '<div class="text-muted">No unsaved changes</div>';
    dialog.showModal();
  });
  document.addEventListener("click", function(e) {
    if (e.target.id === "syncConfirmYes" || e.target.closest("#syncConfirmYes")) {
      if (typeof saveCurrentCode === "function" && activeQuestionId) saveCurrentCode();
      if (typeof saveCurrentNotes === "function" && activeQuestionId) saveCurrentNotes();
      document.dispatchEvent(new CustomEvent("cloud-sync-requested"));
    }
  });
  function init() {
    _dirtySubmissions = {};
    _dirtyNotes = {};
    _dirtyQuizzes = {};
    if (window.location.search.indexOf("session=expired") !== -1) {
      var msg = document.createElement("div");
      msg.className = "alert alert-warning text-center m-0 rounded-0";
      msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Signed out \u2014 your account was accessed from another browser.';
      document.body.prepend(msg);
      setTimeout(function() {
        msg.remove();
      }, 6e3);
    }
    const groupDataEl = document.getElementById("course-groups");
    if (groupDataEl) {
      try {
        const parsed = JSON.parse(groupDataEl.textContent);
        courseGroups = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        courseGroups = [];
      }
    }
    if (!problemDataEl || !activeProblemInput) {
      initFirebase();
      initTypedTitle();
      setupAuth();
      initSync();
      updateSyncIndicator();
      return;
    }
    if (window.location.pathname === "/dashboard/" || window.location.pathname === "/dashboard") {
      try {
        questions = JSON.parse(problemDataEl.textContent) || [];
      } catch (e) {
        questions = [];
      }
      initFirebase();
      initTypedTitle();
      loadSubmissions();
      try {
        var qr = localStorage.getItem("pyjamacode-quiz-results");
        if (qr) quizResults = JSON.parse(qr) || {};
      } catch (e) {
      }
      setupAuth();
      initSidebarToggle();
      initSidebarTabs();
      renderQuestionList();
      renderDashboard();
      updateSyncIndicator();
      window.addEventListener("storage", function() {
        loadSubmissions();
        try {
          var qr2 = localStorage.getItem("pyjamacode-quiz-results");
          if (qr2) quizResults = JSON.parse(qr2) || {};
        } catch (e) {
        }
        renderQuestionList();
        renderDashboard();
      });
      if (typeof firebase !== "undefined" && firebase.apps.length) {
        (function startPoll() {
          var pollTimer = setInterval(function() {
            var user = firebase.auth().currentUser;
            if (!user) return;
            var db = firebase.firestore();
            db.collection("users").doc(user.uid).collection("codes").get().then(function(snap) {
              var changed = false;
              snap.forEach(function(doc) {
                var data = doc.data();
                if (!submissions[doc.id]) submissions[doc.id] = {};
                if (data.code !== void 0 && submissions[doc.id].code !== data.code) {
                  submissions[doc.id].code = data.code;
                  changed = true;
                }
                if (data.status && submissions[doc.id].status !== data.status) {
                  submissions[doc.id].status = data.status;
                  changed = true;
                }
              });
              if (changed) {
                persistSubmissions();
                renderQuestionList();
                renderDashboard();
              }
            });
            db.collection("users").doc(user.uid).collection("quizzes").get().then(function(snap) {
              var changed = false;
              snap.forEach(function(doc) {
                var data = doc.data();
                if (data.results && JSON.stringify(quizResults[doc.id]) !== JSON.stringify(data.results)) {
                  quizResults[doc.id] = data.results;
                  changed = true;
                }
              });
              if (changed) {
                try {
                  localStorage.setItem("pyjamacode-quiz-results", JSON.stringify(quizResults));
                } catch (e) {
                }
                renderQuestionList();
                renderDashboard();
              }
            });
          }, 3e4);
        })();
      }
      return;
    }
    if (window.location.pathname === "/" || window.location.pathname === "") {
      if (typeof isAuthenticated === "function" && isAuthenticated()) {
        window.location.replace("/dashboard/");
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
      console.error("Failed to parse problem data:", e);
      questions = [];
    }
    activeQuestionId = activeProblemInput.value || questions[0] && questions[0].id;
    const courseMatch = window.location.pathname.match(/^\/courses\/([^\/]+)\/?$/);
    if (courseMatch) {
      const introQ = questions.find((q) => q.isIntro && q.topic === courseMatch[1]);
      if (introQ) {
        activeQuestionId = introQ.id;
        treeExpanded[courseMatch[1]] = true;
      }
      const nextBtn = document.getElementById("nextProblemBtn");
      if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
          const firstLesson = questions.find((q) => !q.isIntro && q.topic === courseMatch[1]);
          if (firstLesson) window.location.href = firstLesson.permalink;
        });
      }
    }
    loadSubmissions();
    loadNotes();
    loadBookmarks();
    try {
      const qr2 = localStorage.getItem("pyjamacode-quiz-results");
      if (qr2) quizResults = JSON.parse(qr2) || {};
    } catch (e) {
    }
    initCodeMirror();
    initNotesCodeMirror();
    if (!isAuthenticated()) expandFirstCourseForGuest();
    renderQuestionList();
    const _q = questions.find((q) => q.id === activeQuestionId);
    if (questionContentEl && (!_q || !_q.isIntro)) {
      selectQuestion(activeQuestionId);
    } else if (questionContentEl && _q && _q.isIntro) {
      enhanceImages(questionContentEl);
      initImageZoom(questionContentEl);
      const readingEl = document.getElementById("readingContent");
      if (readingEl) {
        enhanceImages(readingEl);
        initImageZoom(readingEl);
      }
    }
    setNotesPreviewMode(true);
    initTypedTitle();
    notesSavedHeight = notesArea && notesArea.offsetHeight || 320;
    setTimeout(() => minimizeNotes(), 50);
    const notesHeader = notesArea ? notesArea.querySelector(".notes-header") : null;
    if (notesHeader) {
      notesHeader.addEventListener("dblclick", () => {
        if (notesViewState === "minimized") restoreNotes();
        else minimizeNotes();
      });
    }
    if (questionSearchEl) {
      questionSearchEl.addEventListener("input", (e) => {
        const isBookmarks = document.getElementById("bookmarksList") && !document.getElementById("bookmarksList").classList.contains("d-none");
        if (isBookmarks) renderBookmarksList(e.target.value);
        else renderQuestionList(e.target.value);
      });
    }
    if (resetBtn) resetBtn.addEventListener("click", resetCase);
    if (resetAllBtn) resetAllBtn.addEventListener("click", resetAllFiles);
    initSidebarToggle();
    initSidebarTabs();
    initBookmarkBtn();
    initProblemNav();
    if (clearConsoleBtn) clearConsoleBtn.addEventListener("click", () => {
      consoleOutputEl.textContent = "";
    });
    const homeLink = document.getElementById("homeLink");
    if (homeLink) {
      let updateHomeHref2 = function() {
        homeLink.href = typeof isAuthenticated === "function" && isAuthenticated() ? "/dashboard/" : "/";
      };
      var updateHomeHref = updateHomeHref2;
      updateHomeHref2();
      if (typeof onAuthChange !== "undefined") onAuthChange(updateHomeHref2);
    }
    const landingStartBtn = document.getElementById("landingStartBtn");
    if (landingStartBtn) {
      landingStartBtn.addEventListener("click", () => {
        const topic = firstTopicKey();
        if (topic) window.location.href = "/courses/" + topic + "/";
      });
    }
    function setupResumeLink(link) {
      if (!link) return;
      var saved = localStorage.getItem("lastProblemUrl");
      if (saved && saved.includes("/courses/")) {
        link.textContent = "Resume";
        link.onclick = function(e) {
          e.preventDefault();
          var tab = localStorage.getItem("lastProblemTab");
          var url = saved;
          if (tab && tab !== "challenge") url += (url.indexOf("?") === -1 ? "?" : "&") + "tab=" + tab;
          window.location.href = url;
        };
      } else {
        link.textContent = "Start Learning";
        link.onclick = function(e) {
          e.preventDefault();
          if (questions.length) {
            var topics = {};
            questions.forEach(function(q) {
              if (!q.isIntro && q.topic && !topics[q.topic]) topics[q.topic] = q.topic_weight || 99;
            });
            var sorted = Object.keys(topics).sort(function(a, b) {
              return (topics[a] || 99) - (topics[b] || 99);
            });
            if (sorted.length) window.location.href = "/courses/" + sorted[0] + "/";
            else window.location.href = "/dashboard/";
          } else {
            window.location.href = "/dashboard/";
          }
        };
      }
    }
    if (typeof resumeLink !== "undefined") setupResumeLink(resumeLink);
    if (notesModeBtn) notesModeBtn.addEventListener("click", toggleNotesMode);
    if (exportNotesMenuItem) exportNotesMenuItem.addEventListener("click", (e) => {
      e.preventDefault();
      exportNotes();
    });
    if (exportPdfMenuItem) exportPdfMenuItem.addEventListener("click", (e) => {
      e.preventDefault();
      exportNotesPdf();
    });
    if (notesMinimizeBtn) notesMinimizeBtn.addEventListener("click", minimizeNotes);
    if (notesMaximizeBtn) notesMaximizeBtn.addEventListener("click", maximizeNotes);
    if (notesRestoreBtn) notesRestoreBtn.addEventListener("click", restoreNotes);
    const notesAuthPromptSignin = document.getElementById("notesAuthPromptSignin");
    const notesAuthPromptClose = document.getElementById("notesAuthPromptClose");
    if (notesAuthPromptSignin) notesAuthPromptSignin.addEventListener("click", () => {
      hideNotesAuthPrompt();
      if (typeof openAuthModal === "function") openAuthModal("signin");
    });
    if (notesAuthPromptClose) notesAuthPromptClose.addEventListener("click", hideNotesAuthPrompt);
    if (notesPreviewEl) {
      notesPreviewEl.addEventListener("dblclick", (e) => {
        const rect = notesPreviewEl.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(notesPreviewEl).lineHeight) || 24;
        const paddingTop = parseFloat(getComputedStyle(notesPreviewEl).paddingTop) || 0;
        const relativeY = e.clientY - rect.top - paddingTop;
        const approximateLine = Math.max(0, Math.floor(relativeY / lineHeight));
        setNotesPreviewMode(false, approximateLine);
      });
    }
    document.addEventListener("keydown", handleKeyboardShortcuts);
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
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (activeQuestionId) {
        saveCurrentCode();
        saveCurrentNotes();
        hideAllUnsavedDots();
      }
    }
    if (e.key === "Escape" && !notesPreviewMode) {
      e.preventDefault();
      setNotesPreviewMode(true);
    }
  }
  function initResizers() {
    if (resizerCasesCase && sidebarPane) {
      setupHorizontalResize(resizerCasesCase, sidebarPane, "left");
    }
    if (resizerCaseWorkspace && questionPane) {
      setupHorizontalResize(resizerCaseWorkspace, questionPane, "left");
    }
  }
  function createDragOverlay(cursor) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `position:fixed;inset:0;z-index:9999;cursor:${cursor};`;
    document.body.appendChild(overlay);
    return overlay;
  }
  function setupHorizontalResize(resizer, pane, side) {
    if (!resizer || !pane) return;
    resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startWidth = pane.getBoundingClientRect().width;
      const minWidth = 180;
      const maxWidth = Math.max(minWidth, Math.floor(window.innerWidth * 0.45));
      const multiplier = side === "left" ? 1 : -1;
      resizer.classList.add("resizing");
      document.body.style.userSelect = "none";
      const overlay = createDragOverlay("col-resize");
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
        resizer.classList.remove("resizing");
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        refreshEditors();
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }
  function refreshEditors() {
    if (codeMirror) requestAnimationFrame(() => codeMirror.refresh());
    if (notesCodeMirror) requestAnimationFrame(() => notesCodeMirror.refresh());
  }
  function initTooltips() {
    if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((el) => {
      new bootstrap.Tooltip(el, { trigger: "hover" });
    });
  }
  function updateTooltip(element, title) {
    if (!element) return;
    element.setAttribute("title", title);
    element.setAttribute("data-bs-original-title", title);
    if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
    const tooltip = bootstrap.Tooltip.getInstance(element);
    if (tooltip) {
      tooltip.setContent({ ".tooltip-inner": title });
    }
  }
  function initCodeMirror() {
    if (!codeEditorWrapper) return;
    if (typeof CodeMirror === "undefined") {
      codeEditorWrapper.style.display = "none";
      if (codeEditorEl) codeEditorEl.style.display = "block";
      return;
    }
    const activeQuestion = questions.find((q) => q.id === activeQuestionId);
    const language = activeQuestion?.language || "c";
    codeMirror = CodeMirror(codeEditorWrapper, {
      value: codeEditorEl ? codeEditorEl.value : "",
      mode: langToMode(language),
      theme: getCodeMirrorTheme(),
      lineNumbers: true,
      styleActiveLine: true,
      tabSize: 4,
      indentUnit: 4,
      lineWrapping: true,
      autofocus: false
    });
    codeMirror.on("change", () => {
      if (codeEditorEl) {
        codeEditorEl.value = codeMirror.getValue();
      }
      if (!isSettingValue) {
        showFileUnsavedDot(activeFileIndex);
        if (window._codeSaveTimer) clearTimeout(window._codeSaveTimer);
        window._codeSaveTimer = setTimeout(function() {
          if (activeQuestionId) saveCurrentCode();
        }, 1500);
      }
    });
  }
  function getCodeMirrorTheme() {
    return "github-dark";
  }
  function updateCodeMirrorMode(language) {
    if (!codeMirror) return;
    codeMirror.setOption("mode", langToMode(language));
  }
  function initNotesCodeMirror() {
    if (!notesEditorWrapper) return;
    if (typeof CodeMirror === "undefined") {
      notesEditorWrapper.style.display = "none";
      if (notesEditorEl) notesEditorEl.style.display = "block";
      return;
    }
    notesCodeMirror = CodeMirror(notesEditorWrapper, {
      value: notesEditorEl ? notesEditorEl.value : "",
      mode: "markdown",
      theme: getCodeMirrorTheme(),
      lineNumbers: true,
      styleActiveLine: true,
      tabSize: 4,
      indentUnit: 4,
      lineWrapping: true,
      autofocus: false
    });
    notesCodeMirror.on("change", () => {
      if (notesEditorEl) {
        notesEditorEl.value = notesCodeMirror.getValue();
      }
      if (!isSettingNotesValue) {
        showNotesUnsavedDot();
        if (notesPreviewMode) {
          renderNotesPreview();
        }
        if (window._notesSaveTimer) clearTimeout(window._notesSaveTimer);
        window._notesSaveTimer = setTimeout(function() {
          if (activeQuestionId && saveCurrentNotes()) syncNotesToCloud();
          if (!isAuthenticated()) showNotesAuthPrompt();
        }, 1500);
      }
    });
    notesCodeMirror.on("blur", function() {
      if (activeQuestionId && getNotesEditorValue() !== notes[activeQuestionId]) {
        if (saveCurrentNotes()) syncNotesToCloud();
      }
      if (!isAuthenticated()) showNotesAuthPrompt();
    });
  }
  function getNotesEditorValue() {
    return notesCodeMirror ? notesCodeMirror.getValue() : notesEditorEl ? notesEditorEl.value : "";
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
      console.warn("Failed to load saved notes:", e);
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
    } catch (e) {
    }
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
    renderBookmarksList(questionSearchEl ? questionSearchEl.value : "");
  }
  function updateBookmarkBtn(id) {
    const icon = document.querySelector("#bookmarkBtn i");
    if (!icon) return;
    const isBookmarked = id && bookmarks[id];
    icon.className = isBookmarked ? "bi bi-bookmark-fill" : "bi bi-bookmark";
    if (bookmarkBtn) bookmarkBtn.classList.toggle("d-none", !id);
  }
  function renderBookmarksList(filter) {
    const el = document.getElementById("bookmarksList");
    if (!el) return;
    const ids = Object.keys(bookmarks);
    if (ids.length === 0) {
      el.innerHTML = '<div class="p-3 text-muted small">No bookmarked problems yet. Click the <i class="bi bi-bookmark"></i> icon on a problem to add it here.</div>';
      return;
    }
    const filterLower = (filter || "").toLowerCase();
    const matched = questions.filter((q) => ids.includes(q.id) && (!filterLower || q.title.toLowerCase().includes(filterLower)));
    if (matched.length === 0) {
      el.innerHTML = '<div class="p-3 text-muted small">No bookmarks match your search.</div>';
      return;
    }
    el.innerHTML = matched.map((q) => `
    <div class="tree-leaf" data-id="${q.id}">
      <div class="question-title">${(function() {
      var s = getLessonState(q.id);
      return q.isIntro ? "" : '<i class="bi ' + (s === "completed" ? "bi-check-circle-fill text-pass" : s === "in-progress" ? "bi-circle-half text-in-progress" : "bi-circle text-muted") + ' me-1"></i>';
    })()}${escapeHtml(q.title)}</div>
      <div class="question-meta">${q.isIntro ? "Course Overview" : '<span class="diff-pill diff-' + (q.difficulty || "medium") + '">' + (q.difficulty || "medium") + '</span> <span class="leaf-status">' + (submissions[q.id]?.status || "Unattempted") + "</span>"}</div>
    </div>
  `).join("");
    el.querySelectorAll(".tree-leaf").forEach((item) => {
      item.addEventListener("click", () => {
        selectQuestion(item.dataset.id);
      });
    });
  }
  function initSidebarTabs() {
    const tabLessons = document.getElementById("tabLessons");
    const tabBookmarks = document.getElementById("tabBookmarks");
    const questionList = document.getElementById("questionList");
    const bookmarksList = document.getElementById("bookmarksList");
    if (!tabLessons || !tabBookmarks || !questionList || !bookmarksList) return;
    function setSidebarTab(tab) {
      const isBookmarks = tab === "bookmarks";
      tabLessons.classList.toggle("active", !isBookmarks);
      tabBookmarks.classList.toggle("active", isBookmarks);
      questionList.classList.toggle("d-none", isBookmarks);
      bookmarksList.classList.toggle("d-none", !isBookmarks);
      if (isBookmarks) renderBookmarksList(questionSearchEl ? questionSearchEl.value : "");
      else renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
    }
    tabLessons.addEventListener("click", () => setSidebarTab("lessons"));
    tabBookmarks.addEventListener("click", () => setSidebarTab("bookmarks"));
  }
  function initBookmarkBtn() {
    const btn = document.getElementById("bookmarkBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      toggleBookmark(activeQuestionId);
    });
  }
  function persistNotes() {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn("Failed to save notes:", e);
    }
  }
  function showNotesAuthPrompt() {
    if (typeof isAuthenticated === "function" && isAuthenticated()) return;
    const el = document.getElementById("notesAuthPrompt");
    if (el) el.classList.add("show");
  }
  function hideNotesAuthPrompt() {
    const el = document.getElementById("notesAuthPrompt");
    if (el) el.classList.remove("show");
  }
  function saveCurrentNotes() {
    if (!activeQuestionId) return false;
    var val = getNotesEditorValue();
    if ((notes[activeQuestionId] || "") === (val || "")) {
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
  function syncNotesToCloud() {
    document.dispatchEvent(new CustomEvent("cloud-sync-requested"));
  }
  function setNotesPreviewMode(preview, approximateLine = null) {
    notesPreviewMode = preview;
    if (notesPreviewMode) {
      if (saveCurrentNotes()) syncNotesToCloud();
      renderNotesPreview();
      if (notesEditorWrapper) notesEditorWrapper.classList.add("d-none");
      if (notesEditorEl) notesEditorEl.style.display = "none";
      if (notesPreviewEl) notesPreviewEl.classList.remove("d-none");
      if (notesModeBtn) notesModeBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
      updateTooltip(notesModeBtn, "Edit notes");
    } else {
      if (notesEditorWrapper) notesEditorWrapper.classList.remove("d-none");
      if (notesEditorEl) notesEditorEl.style.display = "none";
      if (notesPreviewEl) notesPreviewEl.classList.add("d-none");
      if (notesModeBtn) notesModeBtn.innerHTML = '<i class="bi bi-eye"></i>';
      updateTooltip(notesModeBtn, "Preview rendered notes");
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
  var NOTES_FLOAT_KEY = "pyjamacode-notes-float";
  function saveNotesFloat() {
    if (!notesArea) return;
    try {
      const r = notesArea.getBoundingClientRect();
      localStorage.setItem(NOTES_FLOAT_KEY, JSON.stringify({
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height)
      }));
    } catch (e) {
    }
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
    notesArea.style.left = left + "px";
    notesArea.style.top = top + "px";
    notesArea.style.width = width + "px";
    notesArea.style.height = height + "px";
  }
  function openNotes() {
    notesViewState = "normal";
    if (questionPaneBody) questionPaneBody.classList.remove("notes-maximized");
    if (notesArea) notesArea.classList.remove("notes-hidden", "notes-maximized");
    updateNotesViewButtons();
    if (activeQuestionId && typeof saveCurrentNotes === "function") saveCurrentNotes();
    loadNotes();
    if (activeQuestionId) {
      setNotesEditorValue(notes[activeQuestionId] || "");
    }
    if (notesPreviewMode) renderNotesPreview();
    if (notesArea) notesArea.style.height = notesSavedHeight ? notesSavedHeight + "px" : "";
    refreshEditors();
    if (codeMirror) setTimeout(() => {
      const ta = document.querySelector("#notesEditorWrapper .CodeMirror");
      if (ta) ta.CodeMirror && ta.CodeMirror.focus();
    }, 50);
  }
  function initNotesFloat() {
    if (!notesArea) return;
    notesWidget = document.getElementById("notesWidget");
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(NOTES_FLOAT_KEY) || "null");
    } catch (e) {
    }
    applyNotesFloat(saved);
    const header = notesArea.querySelector(".notes-header");
    if (header) {
      let drag = null;
      header.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button") || e.target.closest(".dropdown")) return;
        if (notesArea.classList.contains("notes-maximized")) return;
        const r = notesArea.getBoundingClientRect();
        drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
        header.setPointerCapture(e.pointerId);
      });
      header.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const r = notesArea.getBoundingClientRect();
        let left = drag.left + (e.clientX - drag.x);
        let top = drag.top + (e.clientY - drag.y);
        left = Math.max(0, Math.min(left, window.innerWidth - Math.min(r.width, 280)));
        top = Math.max(0, Math.min(top, window.innerHeight - Math.min(r.height, 80)));
        notesArea.style.left = left + "px";
        notesArea.style.top = top + "px";
      });
      const stopDrag = () => {
        if (drag) {
          drag = null;
          saveNotesFloat();
        }
      };
      header.addEventListener("pointerup", stopDrag);
      header.addEventListener("pointercancel", stopDrag);
    }
    window.addEventListener("mouseup", () => {
      if (notesViewState === "normal") saveNotesFloat();
    });
    window.addEventListener("resize", () => {
      if (notesArea && !notesArea.classList.contains("notes-maximized")) applyNotesFloat(saved);
    });
    if (notesWidget) {
      notesWidget.addEventListener("click", () => {
        const hidden = notesArea && (notesArea.classList.contains("notes-hidden") || notesViewState === "minimized");
        if (hidden) openNotes();
        else minimizeNotes();
      });
    }
    initNotesResize();
  }
  var NOTES_MIN_W = 280;
  var NOTES_MIN_H = 160;
  function initNotesResize() {
    if (!notesArea) return;
    const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    dirs.forEach((dir) => {
      const h = document.createElement("div");
      h.className = "notes-resize-handle " + dir + "-resize";
      notesArea.appendChild(h);
      h.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (notesArea.classList.contains("notes-maximized")) return;
        const r = notesArea.getBoundingClientRect();
        const start = {
          x: e.clientX,
          y: e.clientY,
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height
        };
        h.setPointerCapture(e.pointerId);
        const onMove = (ev) => {
          const dx = ev.clientX - start.x;
          const dy = ev.clientY - start.y;
          let left = start.left, top = start.top, width = start.width, height = start.height;
          if (dir.includes("e")) width = start.width + dx;
          if (dir.includes("s")) height = start.height + dy;
          if (dir.includes("w")) {
            width = start.width - dx;
            left = start.left + dx;
          }
          if (dir.includes("n")) {
            height = start.height - dy;
            top = start.top + dy;
          }
          width = Math.max(NOTES_MIN_W, width);
          height = Math.max(NOTES_MIN_H, height);
          if (dir.includes("w")) left = Math.min(start.left + start.width - NOTES_MIN_W, left);
          if (dir.includes("n")) top = Math.min(start.top + start.height - NOTES_MIN_H, top);
          left = Math.max(0, Math.min(left, window.innerWidth - NOTES_MIN_W));
          top = Math.max(0, Math.min(top, window.innerHeight - NOTES_MIN_H));
          width = Math.min(width, window.innerWidth - left);
          height = Math.min(height, window.innerHeight - top);
          notesArea.style.left = Math.round(left) + "px";
          notesArea.style.top = Math.round(top) + "px";
          notesArea.style.width = Math.round(width) + "px";
          notesArea.style.height = Math.round(height) + "px";
        };
        const onUp = () => {
          h.removeEventListener("pointermove", onMove);
          h.removeEventListener("pointerup", onUp);
          h.removeEventListener("pointercancel", onUp);
          saveNotesFloat();
        };
        h.addEventListener("pointermove", onMove);
        h.addEventListener("pointerup", onUp);
        h.addEventListener("pointercancel", onUp);
      });
    });
  }
  function minimizeNotes() {
    hideTooltip(notesMinimizeBtn);
    if (notesViewState === "normal" && notesArea && notesArea.offsetHeight) {
      notesSavedHeight = notesArea.offsetHeight;
    }
    notesViewState = "minimized";
    if (questionPaneBody) questionPaneBody.classList.remove("notes-maximized");
    if (notesArea) notesArea.classList.add("notes-hidden", "notes-maximized");
    updateNotesViewButtons();
    refreshEditors();
  }
  function maximizeNotes() {
    hideTooltip(notesMaximizeBtn);
    if (notesViewState === "normal" && notesArea && notesArea.offsetHeight) {
      notesSavedHeight = notesArea.offsetHeight;
    }
    notesViewState = "maximized";
    if (questionPaneBody) questionPaneBody.classList.remove("notes-maximized");
    if (notesArea) notesArea.classList.add("notes-maximized");
    if (notesArea) notesArea.classList.remove("notes-hidden");
    updateNotesViewButtons();
    refreshEditors();
  }
  function restoreNotes() {
    hideTooltip(notesRestoreBtn);
    notesViewState = "normal";
    if (questionPaneBody) questionPaneBody.classList.remove("notes-maximized");
    if (notesArea) {
      notesArea.classList.remove("notes-hidden", "notes-maximized");
    }
    updateNotesViewButtons();
    refreshEditors();
  }
  function updateNotesViewButtons() {
    if (notesMinimizeBtn) {
      notesMinimizeBtn.classList.toggle("d-none", notesViewState === "minimized");
      notesMinimizeBtn.style.order = notesViewState === "minimized" ? "3" : "1";
    }
    if (notesMaximizeBtn) {
      notesMaximizeBtn.classList.toggle("d-none", notesViewState === "maximized");
      notesMaximizeBtn.style.order = notesViewState === "maximized" ? "3" : "2";
    }
    if (notesRestoreBtn) {
      notesRestoreBtn.classList.toggle("d-none", notesViewState === "normal");
      notesRestoreBtn.style.order = notesViewState === "minimized" ? "1" : notesViewState === "maximized" ? "2" : "3";
    }
  }
  function hideTooltip(element) {
    if (!element || typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
    const tooltip = bootstrap.Tooltip.getInstance(element);
    if (tooltip) tooltip.hide();
  }
  function slugifyHeading(text) {
    return (text || "").toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/gi, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  }
  function initHeadingLinks(root) {
    if (!root) return;
    const used = {};
    root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      let id = h.getAttribute("id") || slugifyHeading(h.textContent);
      if (used[id] !== void 0) {
        used[id] += 1;
        id = id + "-" + used[id];
      } else {
        used[id] = 0;
      }
      h.setAttribute("id", id);
      h.classList.add("heading-anchored");
      const link = document.createElement("a");
      link.className = "heading-anchor";
      link.href = "#" + id;
      link.setAttribute("aria-label", "Link to this section");
      link.innerHTML = '<i class="bi bi-link-45deg"></i>';
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = window.location.href.split("#")[0] + "#" + id;
        try {
          history.replaceState(null, "", window.location.pathname + window.location.search + "#" + id);
        } catch (err) {
        }
        h.scrollIntoView({ behavior: "smooth", block: "start" });
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(() => {
          });
        }
        showHeadingLinkFeedback(link);
      });
      h.appendChild(link);
    });
  }
  function showHeadingLinkFeedback(link) {
    if (!link) return;
    link.classList.add("copied");
    if (link._copiedTimer) clearTimeout(link._copiedTimer);
    link._copiedTimer = setTimeout(() => link.classList.remove("copied"), 1200);
  }
  function renderNotesPreview() {
    if (!notesPreviewEl) return;
    const markdown = getNotesEditorValue() || "*No notes yet.*";
    let html = "";
    if (typeof marked !== "undefined") {
      try {
        html = marked.parse(markdown, { breaks: true, gfm: true });
      } catch (e) {
        html = escapeHtml(markdown);
      }
    } else {
      html = escapeHtml(markdown);
    }
    notesPreviewEl.innerHTML = html;
    enhanceCodeBlocks(notesPreviewEl, { skipCaption: true });
    initHeadingLinks(notesPreviewEl);
  }
  function exportNotes() {
    if (!activeQuestionId) return;
    const question = questions.find((q) => q.id === activeQuestionId);
    const title = question ? question.title : activeQuestionId;
    const content = getNotesEditorValue() || "";
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = title.replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "notes";
    a.download = `${safeTitle}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function exportNotesPdf() {
    if (!activeQuestionId) return;
    const question = questions.find((q) => q.id === activeQuestionId);
    const title = question ? question.title : activeQuestionId;
    const safeTitle = title.replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "notes";
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
      exportNotes();
      return;
    }
    const markdown = getNotesEditorValue() || "";
    let html = "";
    if (typeof marked !== "undefined") {
      try {
        html = marked.parse(markdown, { breaks: true, gfm: true });
      } catch (e) {
        html = escapeHtml(markdown);
      }
    } else {
      html = escapeHtml(markdown);
    }
    if (!html) html = "<p>No notes yet.</p>";
    const cs = getComputedStyle(document.documentElement);
    const v = (name) => cs.getPropertyValue(name).trim();
    const pdfVars = {
      "--bs-body-bg": v("--pdf-canvas-default") || "#ffffff",
      "--bs-body-color": v("--pdf-fg-default") || "#1f2328",
      "--bs-secondary-bg": v("--pdf-canvas-subtle") || "#f6f8fa",
      "--bs-secondary-color": v("--pdf-fg-muted") || "#656d76",
      "--bs-border-color": v("--pdf-border-default") || "#d0d7de",
      "--bs-primary": v("--pdf-accent") || "#0969da",
      "--bs-success": v("--pdf-success") || "#1a7f37",
      "--bs-warning": v("--pdf-warning") || "#9a6700",
      "--bs-danger": v("--pdf-danger") || "#cf222e",
      "--editor-bg": v("--pdf-code-bg") || "#f6f8fa",
      "--editor-fg": v("--pdf-fg-default") || "#1f2328",
      "--code-bg": v("--pdf-code-bg") || "#f6f8fa",
      "--border-color": v("--pdf-border-default") || "#d0d7de",
      "--accent-color": v("--pdf-accent") || "#0969da",
      "--accent-hover": v("--pdf-accent-hover") || "#0550ae",
      "--success-color": v("--pdf-success") || "#1a7f37",
      "--success-hover": v("--pdf-success-hover") || "#136c2e",
      "--warning-color": v("--pdf-warning") || "#9a6700",
      "--danger-color": v("--pdf-danger") || "#cf222e",
      "--btn-default-bg": v("--pdf-btn-default-bg") || "#f6f8fa",
      "--btn-default-border": v("--pdf-btn-default-border") || "rgba(31,35,40,0.15)",
      "--btn-default-hover": v("--pdf-btn-default-hover") || "#f3f4f6",
      "--active-item-bg": "rgba(9, 105, 218, 0.1)"
    };
    const container = document.createElement("div");
    container.className = "pdf-export-container question-content";
    container.id = "pdfExportContainer";
    let vars = "";
    for (const k in pdfVars) vars += k + ":" + pdfVars[k] + ";";
    container.style.cssText += vars;
    container.innerHTML = html;
    enhanceCodeBlocks(container, { skipCaption: true });
    const hljsLight = document.createElement("style");
    hljsLight.textContent = ".pdf-export-container .hljs{color:#1f2328;background:#ffffff}.pdf-export-container .hljs-comment,.pdf-export-container .hljs-quote{color:#6e7781;font-style:italic}.pdf-export-container .hljs-keyword,.pdf-export-container .hljs-selector-tag,.pdf-export-container .hljs-literal,.pdf-export-container .hljs-section,.pdf-export-container .hljs-link{color:#cf222e}.pdf-export-container .hljs-string,.pdf-export-container .hljs-regexp,.pdf-export-container .hljs-addition,.pdf-export-container .hljs-symbol,.pdf-export-container .hljs-bullet,.pdf-export-container .hljs-meta{color:#0a3069}.pdf-export-container .hljs-number,.pdf-export-container .hljs-title,.pdf-export-container .hljs-attr,.pdf-export-container .hljs-attribute,.pdf-export-container .hljs-built_in,.pdf-export-container .hljs-doctag{color:#0550ae}.pdf-export-container .hljs-name,.pdf-export-container .hljs-type,.pdf-export-container .hljs-selector-id,.pdf-export-container .hljs-selector-class,.pdf-export-container .hljs-template-variable,.pdf-export-container .hljs-variable{color:#953800}.pdf-export-container .hljs-deletion,.pdf-export-container .hljs-selector-attr,.pdf-export-container .hljs-selector-pseudo{color:#82071e}";
    container.appendChild(hljsLight);
    document.body.appendChild(container);
    if (exportPdfMenuItem) exportPdfMenuItem.disabled = true;
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const pdf = new window.jspdf.jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 36;
        const pageContentH = pageH - 2 * margin;
        const pxPerPt = canvas.width / pageW;
        const sliceHpx = pageContentH * pxPerPt;
        let offsetPx = 0;
        let first = true;
        while (offsetPx < canvas.height) {
          const hpx = Math.min(sliceHpx, canvas.height - offsetPx);
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = Math.round(hpx);
          slice.getContext("2d").drawImage(canvas, 0, offsetPx, canvas.width, hpx, 0, 0, canvas.width, hpx);
          if (!first) pdf.addPage();
          pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, margin, pageW, hpx / pxPerPt);
          first = false;
          offsetPx += hpx;
        }
        pdf.save(safeTitle + "-notes.pdf");
      } catch (err) {
        console.error("PDF export failed:", err);
        exportNotes();
      } finally {
        if (exportPdfMenuItem) exportPdfMenuItem.disabled = false;
        container.remove();
      }
    }, 150);
  }
  function getEditorValue() {
    return codeMirror ? codeMirror.getValue() : codeEditorEl ? codeEditorEl.value : "";
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
      const topic = q.topic || "";
      const subtopic = q.subtopic || "";
      if (!tree[topic]) tree[topic] = {};
      if (!tree[topic][subtopic]) tree[topic][subtopic] = [];
      tree[topic][subtopic].push(q);
    });
    return tree;
  }
  var _quizCountCache = {};
  function getLessonState(id) {
    var q = questions.find(function(q2) {
      return q2.id === id;
    });
    if (!q) return "unattempted";
    var codeStatus = submissions[id]?.status || "";
    var codeAccepted = codeStatus === "Accepted";
    var codeInProgress = codeStatus && codeStatus !== "Unattempted";
    var correctCount = quizResults[id] ? Object.keys(quizResults[id]).length : 0;
    var totalQuiz = 0;
    if (q.quiz && q.quiz.trim()) {
      if (_quizCountCache[id] === void 0) {
        var blocks = q.quiz.split(/\n##\s*/).filter(function(b) {
          return b.trim().length > 0;
        });
        _quizCountCache[id] = blocks.length;
      }
      totalQuiz = _quizCountCache[id];
    }
    if (codeAccepted && (totalQuiz === 0 || correctCount >= totalQuiz)) return "completed";
    if (codeAccepted && totalQuiz > 0 && correctCount < totalQuiz) return "in-progress";
    if (correctCount > 0) return "in-progress";
    if (codeInProgress) return "in-progress";
    return "unattempted";
  }
  function toggleTopic(topic) {
    treeExpanded[topic] = !treeExpanded[topic];
    renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
  }
  function toggleSubtopic(topic, subtopic) {
    const key = topic + "/" + subtopic;
    treeExpanded[key] = !treeExpanded[key];
    renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
  }
  function renderDashboard() {
    var contentEl = document.getElementById("dashboardContent");
    if (!contentEl || !questions.length) return;
    var subs = {};
    try {
      subs = JSON.parse(localStorage.getItem("pyjamacode-submissions") || "{}");
    } catch (e) {
    }
    var quizRes = {};
    try {
      quizRes = JSON.parse(localStorage.getItem("pyjamacode-quiz-results") || "{}");
    } catch (e) {
    }
    function localLessonState(id) {
      var q = questions.find(function(q2) {
        return q2.id === id;
      });
      if (!q) return "unattempted";
      var codeStatus = subs[id]?.status || "";
      var codeAccepted = codeStatus === "Accepted";
      var codeInProgress = codeStatus && codeStatus !== "Unattempted";
      var correctCount = quizRes[id] ? Object.keys(quizRes[id]).length : 0;
      var totalQuiz = 0;
      if (q.quiz && q.quiz.trim()) {
        var blocks = q.quiz.split(/\n##\s*/).filter(function(b) {
          return b.trim().length > 0;
        });
        totalQuiz = blocks.length;
      }
      if (codeAccepted && (totalQuiz === 0 || correctCount >= totalQuiz)) return "completed";
      if (codeAccepted && totalQuiz > 0 && correctCount < totalQuiz) return "in-progress";
      if (correctCount > 0) return "in-progress";
      if (codeInProgress) return "in-progress";
      return "unattempted";
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
      lessonList.sort(function(a, b) {
        return (a.weight || 99) - (b.weight || 99);
      });
      return lessonList[0];
    }
    function resumeLesson(lessonList) {
      lessonList.sort(function(a, b) {
        return (a.weight || 99) - (b.weight || 99);
      });
      for (var i = 0; i < lessonList.length; i++) {
        var s = subs[lessonList[i].id];
        if (!s || !s.status || s.status === "Unattempted") return lessonList[i];
      }
      return null;
    }
    var courseMeta = {};
    try {
      courseMeta = JSON.parse(document.getElementById("course-meta").textContent || "{}");
    } catch (e) {
    }
    var html = '<div class="dashboard-courses">';
    sortedTopics.forEach(function(topic) {
      var info = topics[topic];
      var lessonList = info.lessons;
      lessonList.sort(function(a, b) {
        return (a.weight || 99) - (b.weight || 99);
      });
      var topicTitle = topic;
      if (lessonList[0] && lessonList[0].topic_title) topicTitle = lessonList[0].topic_title;
      var meta = courseMeta[topic] || {};
      var topicDesc = meta.description || "";
      var topicImage = meta.og_image || "";
      var total = lessonList.length;
      var completed = 0;
      var inProgress = 0;
      lessonList.forEach(function(q) {
        var st = localLessonState(q.id);
        if (st === "completed") completed++;
        else if (st === "in-progress") inProgress++;
      });
      var pct = total ? Math.round(completed / total * 100) : 0;
      var resumeUrl = "/courses/" + topic + "/";
      if (pct > 0 && pct < 100) {
        var resume = resumeLesson(lessonList);
        if (resume) resumeUrl = resume.permalink;
      }
      html += '<div class="course-card">' + (topicImage ? '<img src="' + escapeHtml(topicImage) + `" alt="" class="course-card-img" loading="lazy" onerror="this.style.display='none'">` : "") + '<div class="course-card-body"><h4 class="course-card-title">' + escapeHtml(topicTitle) + "</h4>" + (topicDesc ? '<p class="course-card-desc">' + escapeHtml(topicDesc) + "</p>" : "") + '<div class="progress mb-2" style="height:6px"><div class="progress-bar" role="progressbar" style="width:' + pct + '%"></div></div><div class="course-card-footer"><span class="course-card-stat">' + completed + "/" + total + (pct === 100 ? ' <span class="text-pass fw-semibold">Complete</span>' : inProgress > 0 ? ' <span class="text-in-progress">' + inProgress + " active</span>" : "") + "</span>";
      if (resumeUrl) {
        var btnLabel = pct >= 100 ? "Start Again" : pct > 0 ? "Resume" : "Start";
        html += '<a href="' + resumeUrl + '" class="btn btn-sm btn-outline-primary">' + btnLabel + "</a>";
      }
      html += "</div></div></div>";
    });
    html += "</div>";
    var existing = contentEl.querySelector(".dashboard-courses");
    if (existing) existing.remove();
    var p = contentEl.querySelector("p");
    if (p) p.insertAdjacentHTML("afterend", html);
    else contentEl.insertAdjacentHTML("beforeend", html);
  }
  function getWeight(q, key, fallback) {
    const v = q[key];
    return v !== void 0 && v !== null ? v : fallback;
  }
  function groupsForTopic(topic) {
    const out = [];
    courseGroups.forEach((g) => {
      if (!g || !g.title || !g.courses) return;
      if (g.courses.indexOf(topic) !== -1) {
        out.push({ title: g.title, weight: g.weight !== void 0 && g.weight !== null ? g.weight : 99 });
      }
    });
    return out;
  }
  function firstTopicKey() {
    const tree = buildQuestionTree();
    const topicWeight = {};
    questions.forEach((q) => {
      const t = q.topic || "";
      const tw = getWeight(q, "topic_weight", 99);
      if (topicWeight[t] === void 0 || tw < topicWeight[t]) topicWeight[t] = tw;
    });
    const byWeight = (a, b) => (topicWeight[a] ?? 99) - (topicWeight[b] ?? 99);
    const groupWeight = {};
    const definedGroups = [];
    courseGroups.forEach((g) => {
      if (!g || !g.title) return;
      if (!(g.title in groupWeight)) definedGroups.push(g.title);
      if (g.weight === void 0 || g.weight === null || groupWeight[g.title] === void 0) {
        groupWeight[g.title] = g.weight !== void 0 && g.weight !== null ? g.weight : 99;
      }
    });
    const groupOrder = definedGroups.slice().sort((a, b) => (groupWeight[a] ?? 99) - (groupWeight[b] ?? 99));
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
    ungrouped.sort(byWeight);
    if (ungrouped.length) return ungrouped[0];
    for (const g of groupOrder) {
      if (groupsMap[g] && groupsMap[g].length) return groupsMap[g].slice().sort(byWeight)[0];
    }
    const topics = Object.keys(tree);
    return topics.length ? topics[0] : null;
  }
  function expandFirstCourseForGuest() {
    if (typeof isAuthenticated === "function" && isAuthenticated()) return;
    const topic = firstTopicKey();
    if (!topic) return;
    treeExpanded[topic] = true;
    const subs = {};
    questions.forEach((q) => {
      if (q.topic === topic && q.subtopic) subs[q.subtopic] = true;
    });
    Object.keys(subs).forEach((s) => {
      treeExpanded[topic + "/" + s] = true;
    });
    const gs = groupsForTopic(topic);
    if (gs.length) {
      expandedGroup = gs[0].title;
      _groupsInitialized = true;
    }
  }
  function renderQuestionList(filter = "") {
    questionListEl.innerHTML = "";
    const tree = buildQuestionTree();
    const filterLower = filter.toLowerCase();
    const topicWeight = {};
    const subtopicWeight = {};
    questions.forEach((q) => {
      const t = q.topic || "";
      const st = q.subtopic || "";
      const tw = getWeight(q, "topic_weight", 99);
      const sw = getWeight(q, "subtopic_weight", 99);
      if (topicWeight[t] === void 0 || tw < topicWeight[t]) topicWeight[t] = tw;
      const sk = t + "/" + st;
      if (subtopicWeight[sk] === void 0 || sw < subtopicWeight[sk]) subtopicWeight[sk] = sw;
    });
    const sortTopics = (a, b) => (topicWeight[a] ?? 99) - (topicWeight[b] ?? 99);
    const groupWeight = {};
    const definedGroups = [];
    courseGroups.forEach((g) => {
      if (!g || !g.title) return;
      if (!(g.title in groupWeight)) definedGroups.push(g.title);
      if (g.weight === void 0 || g.weight === null || groupWeight[g.title] === void 0) {
        groupWeight[g.title] = g.weight !== void 0 && g.weight !== null ? g.weight : 99;
      }
    });
    const groupOrder = definedGroups.slice().sort((a, b) => (groupWeight[a] ?? 99) - (groupWeight[b] ?? 99));
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
    groupOrder.forEach((g) => {
      if (groupsMap[g]) groupsMap[g].sort(sortTopics);
    });
    ungrouped.sort(sortTopics);
    const hasGroups = groupOrder.length > 0;
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
      var topicTitle = topic;
      var tq = questions.find(function(q) {
        return q.topic === topic && q.topic_title;
      });
      if (tq) topicTitle = tq.topic_title;
      let hasVisibleChildren = false;
      const topicIntroQs = questions.filter((q) => q.isIntro && q.topic === topic);
      if (topicIntroQs.length > 0) hasVisibleChildren = true;
      Object.keys(subtopics).forEach((subtopic) => {
        const questionsInSub = subtopics[subtopic];
        const visibleQ = filter.length > 0 ? questionsInSub.filter((q) => q.title.toLowerCase().includes(filterLower)) : questionsInSub;
        if (visibleQ.length > 0 || isTopicExpanded && questionsInSub.length > 0) {
          hasVisibleChildren = true;
        }
      });
      if (!hasVisibleChildren) return;
      const topicDiv = document.createElement("div");
      topicDiv.className = "tree-topic";
      topicDiv.dataset.topicIndex = topicIndex;
      if (filter.length > 0) topicDiv.classList.add("expanded");
      else topicDiv.classList.toggle("expanded", !!treeExpanded[topic]);
      topicDiv.innerHTML = `
      <span class="tree-toggle">
        <i class="bi ${treeExpanded[topic] || filter.length > 0 ? "bi-chevron-down" : "bi-chevron-right"}"></i>
      </span>
      <span class="tree-label">${escapeHtml(topicTitle)}</span>
    `;
      topicDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopic(topic);
      });
      container.appendChild(topicDiv);
      if (treeExpanded[topic] || filter.length > 0) {
        const introQs = questions.filter((q) => q.isIntro && q.topic === topic);
        introQs.sort((a, b) => getWeight(a, "weight", 99) - getWeight(b, "weight", 99));
        introQs.forEach((q) => {
          if (filter.length > 0 && !q.title.toLowerCase().includes(filterLower)) return;
          const item = document.createElement("div");
          item.className = "tree-leaf";
          item.dataset.id = q.id;
          item.dataset.topicIndex = topicIndex;
          if (q.id === activeQuestionId) item.classList.add("active");
          item.innerHTML = `
          <div class="question-title">${escapeHtml(q.title)}</div>
          <div class="question-meta">Course Overview</div>
        `;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = q.permalink || "/courses/" + q.topic + "/";
          });
          container.appendChild(item);
        });
      }
      if (!treeExpanded[topic] && filter.length === 0) return;
      const sortedSubtopics = Object.keys(subtopics).sort((a, b) => {
        const skA = topic + "/" + a;
        const skB = topic + "/" + b;
        return (subtopicWeight[skA] ?? 99) - (subtopicWeight[skB] ?? 99);
      });
      sortedSubtopics.forEach((subtopic) => {
        const questionsInSub = subtopics[subtopic];
        const visibleQ = filter.length > 0 ? questionsInSub.filter((q) => q.title.toLowerCase().includes(filterLower)) : questionsInSub;
        if (visibleQ.length === 0 && !(isTopicExpanded && questionsInSub.length > 0)) return;
        const subKey = topic + "/" + subtopic;
        const isSubExpanded = treeExpanded[subKey] || filter.length > 0;
        const subDiv = document.createElement("div");
        subDiv.className = "tree-subtopic";
        subDiv.dataset.topicIndex = topicIndex;
        if (filter.length > 0) subDiv.classList.add("expanded");
        else subDiv.classList.toggle("expanded", !!treeExpanded[subKey]);
        subDiv.innerHTML = `
        <span class="tree-toggle">
          <i class="bi ${treeExpanded[subKey] || filter.length > 0 ? "bi-chevron-down" : "bi-chevron-right"}"></i>
        </span>
        <span class="tree-label">${escapeHtml(subtopic)}</span>
      `;
        subDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleSubtopic(topic, subtopic);
        });
        container.appendChild(subDiv);
        if (!isSubExpanded) return;
        const sortedQuestions = [...questionsInSub].sort(
          (a, b) => getWeight(a, "weight", 99) - getWeight(b, "weight", 99)
        );
        sortedQuestions.forEach((q) => {
          if (q.isIntro || q.hidden) return;
          if (filter.length > 0 && !q.title.toLowerCase().includes(filterLower)) return;
          const item = document.createElement("div");
          item.className = "tree-leaf";
          item.dataset.id = q.id;
          item.dataset.topicIndex = topicIndex;
          if (q.id === activeQuestionId) item.classList.add("active");
          if (submissions[q.id]?.status === "Accepted") item.classList.add("solved");
          var lessonState = getLessonState(q.id);
          var iconClass = lessonState === "completed" ? "bi-check-circle-fill text-pass" : lessonState === "in-progress" ? "bi-circle-half text-in-progress" : "bi-circle text-muted";
          item.innerHTML = `
          <div class="question-title"><i class="bi ${iconClass} me-1"></i>${escapeHtml(q.title)}</div>
          <div class="question-meta"><span class="diff-pill diff-${q.difficulty || "medium"}">${q.difficulty || "medium"}</span> <span class="leaf-status">${submissions[q.id]?.status || "Unattempted"}</span></div>
        `;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectQuestion(q.id);
          });
          container.appendChild(item);
        });
      });
    }
    let colorIndex = 0;
    ungrouped.forEach((topic) => {
      const before = questionListEl.childElementCount;
      renderTopic(topic, colorIndex, questionListEl);
      if (questionListEl.childElementCount > before) colorIndex++;
    });
    groupOrder.forEach((group) => {
      const topics = groupsMap[group];
      if (filter.length > 0 && !topics.some(topicHasMatch)) return;
      const isExpanded = filter.length > 0 ? true : group === expandedGroup;
      const groupDiv = document.createElement("div");
      groupDiv.className = "tree-group";
      if (filter.length > 0) groupDiv.classList.add("expanded");
      else groupDiv.classList.toggle("expanded", isExpanded);
      groupDiv.innerHTML = `
      <span class="tree-toggle">
        <i class="bi ${isExpanded ? "bi-chevron-down" : "bi-chevron-right"}"></i>
      </span>
      <span class="tree-label">${escapeHtml(group)}</span>
    `;
      groupDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        expandedGroup = expandedGroup === group ? null : group;
        renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
      });
      questionListEl.appendChild(groupDiv);
      if (!isExpanded) return;
      const itemsWrap = document.createElement("div");
      itemsWrap.className = "tree-group-items";
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
    const meta = item.querySelector(".question-meta");
    const statusEl = meta ? meta.querySelector(".leaf-status") : null;
    if (statusEl) {
      statusEl.textContent = status;
    }
    item.classList.toggle("solved", status === "Accepted");
  }
  function selectQuestion(id) {
    const question = questions.find((q) => q.id === id);
    if (!question) return;
    if (question.isIntro) {
      window.location.href = question.permalink || "/courses/" + question.topic + "/";
      return;
    }
    if (/^\/courses\/[^\/]+\/?$/.test(window.location.pathname)) {
      window.location.href = question.permalink;
      return;
    }
    const hasEditor = document.getElementById("editorArea");
    const hasReadingPane = document.getElementById("readingContent") || document.getElementById("readingPane");
    if (!hasEditor && !hasReadingPane) {
      window.location.href = question.permalink;
      return;
    }
    if (notesEditorPopulated && typeof saveCurrentNotes === "function" && activeQuestionId) {
      if (saveCurrentNotes()) syncNotesToCloud();
    }
    if (notesEditorPopulated && typeof saveCurrentCode === "function" && activeQuestionId) saveCurrentCode();
    if (window._notesSaveTimer) {
      clearTimeout(window._notesSaveTimer);
      window._notesSaveTimer = null;
    }
    if (window._codeSaveTimer) {
      clearTimeout(window._codeSaveTimer);
      window._codeSaveTimer = null;
    }
    const pageIsCode = !!hasEditor;
    if (pageIsCode !== (question.code_layout === true)) {
      window.location.href = question.permalink;
      return;
    }
    activeQuestionId = id;
    if (editorArea) editorArea.classList.remove("d-none");
    if (notesArea) notesArea.classList.remove("d-none");
    if (fileTabs) fileTabs.classList.remove("d-none");
    const ct = document.getElementById("centerTabs");
    if (ct) ct.classList.remove("d-none");
    if (!questionContentEl) {
      window.location.href = question.permalink;
      return;
    }
    const hasArticle = question.article && question.article.trim().length > 0;
    let quizRaw = question.quiz;
    if (!quizRaw || !quizRaw.trim()) {
      quizRaw = question._raw_quiz;
    }
    const hasQuiz = quizRaw && quizRaw.trim().length > 0;
    const hasReading = !!(question.reading && question.reading.trim().length > 0);
    const hasChallenge = question.has_challenge !== false;
    if (tabArticle) {
      tabArticle.classList.toggle("d-none", !hasArticle);
    }
    if (tabReading) {
      tabReading.classList.toggle("d-none", !hasReading);
    }
    if (tabQuiz) {
      tabQuiz.classList.toggle("d-none", !hasQuiz);
    }
    if (tabChallenge) {
      tabChallenge.classList.toggle("d-none", !hasChallenge);
    }
    const bpMobile = window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint || 800;
    const readingMergedHidden = !!document.getElementById("readingPane") && (window.innerWidth > bpMobile || window.innerWidth <= 767);
    const tabAvailable = (t) => t === "explanation" ? hasArticle : t === "reading" ? hasReading && !readingMergedHidden : t === "quiz" ? hasQuiz : hasChallenge;
    const urlTab = new URL(window.location).searchParams.get("tab");
    let startTab = "challenge";
    if (urlTab && tabAvailable(urlTab)) {
      startTab = urlTab;
    } else if (tabAvailable("explanation")) {
      startTab = "explanation";
    } else {
      startTab = ["reading", "quiz", "challenge"].find(tabAvailable) || "challenge";
    }
    setActiveTab(startTab);
    questionContentEl.innerHTML = question.content;
    questionContentEl.querySelectorAll("pre[data-starter], [data-run-check]").forEach((el) => el.remove());
    applyAuthGates(questionContentEl);
    enhanceCodeBlocks(questionContentEl);
    enhanceImages(questionContentEl);
    initImageZoom(questionContentEl);
    embedYouTubeLinks(questionContentEl);
    initVimeoPlayers(questionContentEl);
    initHeadingLinks(questionContentEl);
    if (articleContentEl) {
      articleContentEl.innerHTML = hasArticle ? question.article : "";
      articleContentEl.querySelectorAll("pre[data-starter], [data-run-check]").forEach((el) => el.remove());
      applyAuthGates(articleContentEl);
      enhanceCodeBlocks(articleContentEl);
      enhanceImages(articleContentEl);
      initImageZoom(articleContentEl);
      embedYouTubeLinks(articleContentEl);
      initVimeoPlayers(articleContentEl);
      initHeadingLinks(articleContentEl);
    }
    const renderReading = (el) => {
      if (!el) return;
      const labRaw = !hasReading && question.codes && question.codes.trim().length > 0 ? question.codes : "";
      el.innerHTML = hasReading ? question.reading : labRaw ? '<h2 id="practical-lab">Practical Lab</h2>' + labRaw : '<p class="text-muted">No additional material for this chapter.</p>';
      if (!hasReading && !labRaw) {
        const pane = el.closest(".platform-pane");
        if (pane) pane.classList.add("d-none");
      }
      el.querySelectorAll("pre[data-starter], [data-run-check]").forEach((n) => n.remove());
      applyAuthGates(el);
      enhanceCodeBlocks(el);
      enhanceImages(el);
      initImageZoom(el);
      embedYouTubeLinks(el);
      initVimeoPlayers(el);
      initHeadingLinks(el);
    };
    renderReading(document.getElementById("readingContent"));
    renderReading(readingTabContentEl);
    const firstH2 = questionContentEl.querySelector("h2:first-of-type");
    if (firstH2) {
      const existing = firstH2.querySelector(".diff-badge");
      if (existing) existing.remove();
      const badge = document.createElement("span");
      badge.className = "diff-badge badge " + (difficultyClasses[question.difficulty] || "text-bg-secondary");
      badge.textContent = question.difficulty;
      firstH2.appendChild(badge);
    }
    questionContentEl.classList.remove("diff-easy", "diff-medium", "diff-hard");
    if (question.difficulty) {
      questionContentEl.classList.add("diff-" + question.difficulty);
    }
    const caseTitleEl = document.getElementById("caseTitle");
    if (caseTitleEl) caseTitleEl.textContent = question.title;
    updateBookmarkBtn(activeQuestionId);
    if (languageLabelEl) {
      languageLabelEl.textContent = (question.language || "c").toUpperCase();
    }
    updateCodeMirrorMode(question.language || "c");
    if (hasEditor) {
      buildFileTabs(question);
      if (consoleOutputEl) {
        consoleOutputEl.innerHTML = submissions[id] && submissions[id].output ? submissions[id].output : "When ready, hit Check to compile and run the code.";
      }
      updateStatus(submissions[id] && submissions[id].status ? submissions[id].status : "Unattempted");
    }
    const savedNotes = notes[id] || "";
    setNotesEditorValue(savedNotes);
    notesEditorPopulated = true;
    if (notesPreviewMode) {
      renderNotesPreview();
    }
    if (question.topic) {
      treeExpanded[question.topic] = true;
      if (question.subtopic) {
        treeExpanded[question.topic + "/" + question.subtopic] = true;
      }
    }
    if (question.topic) {
      const aqGroups = groupsForTopic(question.topic);
      if (aqGroups.length) {
        expandedGroup = aqGroups[0].title;
        _groupsInitialized = true;
      }
    }
    renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
    try {
      let url = question.permalink;
      url += window.location.search;
      url += window.location.hash;
      history.replaceState(null, "", url);
      maybeSaveProblemUrl(url);
    } catch (e) {
    }
    setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const id2 = hash.slice(1);
        const target = document.getElementById(id2);
        if (target) {
          if (articleContentEl && articleContentEl.contains(target) && tabArticle) {
            setActiveTab("explanation");
          } else if (readingTabContentEl && readingTabContentEl.contains(target) && tabReading) {
            setActiveTab("reading");
          } else if (quizContentEl && quizContentEl.contains(target) && tabQuiz) {
            setActiveTab("quiz");
          } else if (questionContentEl && questionContentEl.contains(target) && tabChallenge) {
            setActiveTab("challenge");
          }
          setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
        }
      }
    }, 100);
  }
  function updateStatus(status) {
    const displayStatus = status || "Unattempted";
    if (statusTextEl) {
      statusTextEl.textContent = displayStatus;
      statusTextEl.className = "small " + (displayStatus === "Accepted" ? "text-pass" : displayStatus === "Wrong Answer" || displayStatus === "Runtime Error" || displayStatus === "Compilation Error" ? "text-fail" : "");
    }
  }
  function loadSubmissions() {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (saved) {
        submissions = JSON.parse(saved) || {};
      }
    } catch (e) {
      console.warn("Failed to load saved submissions:", e);
      submissions = {};
    }
  }
  function persistSubmissions() {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.warn("Failed to save submissions:", e);
    }
  }
  function resetCase() {
    if (!activeQuestionId) return;
    const question = questions.find((q) => q.id === activeQuestionId);
    if (!question) return;
    if (fileList.length > 0) {
      const file = fileList[activeFileIndex];
      if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
      if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
      submissions[activeQuestionId].files[file.filename] = file.content;
      setEditorValue(file.content);
    } else {
      delete submissions[activeQuestionId];
      setEditorValue("");
    }
    if (!submissions[activeQuestionId]) submissions[activeQuestionId] = { status: "Unattempted", output: "" };
    submissions[activeQuestionId].status = "Unattempted";
    updateStatus("Unattempted");
    _dirtySubmissions[activeQuestionId] = true;
    addDirtyId(activeQuestionId);
    if (notes[activeQuestionId] && notes[activeQuestionId].trim()) {
      _dirtyNotes[activeQuestionId] = true;
      addDirtyId(activeQuestionId);
    }
    bumpLocalVersion();
    persistSubmissions();
    if (fileList.length > 0) {
      const file = fileList[activeFileIndex];
      delete unsavedFiles[file.filename];
      refreshFileUnsavedDots();
    } else {
      unsavedFiles = {};
      hideAllUnsavedDots();
    }
    renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
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
    submissions[activeQuestionId].status = "Unattempted";
    updateStatus("Unattempted");
    unsavedFiles = {};
    hideAllUnsavedDots();
    _dirtySubmissions[activeQuestionId] = true;
    addDirtyId(activeQuestionId);
    if (notes[activeQuestionId] && notes[activeQuestionId].trim()) {
      _dirtyNotes[activeQuestionId] = true;
      addDirtyId(activeQuestionId);
    }
    bumpLocalVersion();
    persistSubmissions();
    renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
  }
  function saveCurrentCode() {
    if (!activeQuestionId) return;
    const code = getEditorValue();
    if (fileList.length > 0) {
      const file = fileList[activeFileIndex];
      if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
      if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
      if (submissions[activeQuestionId].files[file.filename] === code) {
        hideFileUnsavedDot();
        return;
      }
      submissions[activeQuestionId].files[file.filename] = code;
    } else {
      if (!submissions[activeQuestionId]) {
        submissions[activeQuestionId] = { status: "In Progress", output: "", code: "" };
      }
      if (submissions[activeQuestionId].code === code) {
        hideFileUnsavedDot();
        return;
      }
      submissions[activeQuestionId].code = code;
    }
    if (!submissions[activeQuestionId].status || submissions[activeQuestionId].status === "Unattempted") {
      submissions[activeQuestionId].status = "In Progress";
      updateStatus("In Progress");
      updateTreeItemStatus(activeQuestionId, "In Progress");
    }
    hideFileUnsavedDot();
    _dirtySubmissions[activeQuestionId] = true;
    addDirtyId(activeQuestionId);
    bumpLocalVersion();
    updateSyncIndicator();
    persistSubmissions();
  }
  function initTabs() {
    if (tabChallenge) {
      tabChallenge.addEventListener("click", () => setActiveTab("challenge"));
    }
    if (tabArticle) {
      tabArticle.addEventListener("click", () => setActiveTab("explanation"));
    }
    if (tabReading) {
      tabReading.addEventListener("click", () => setActiveTab("reading"));
    }
    if (tabQuiz) {
      tabQuiz.addEventListener("click", () => setActiveTab("quiz"));
    }
  }
  function parseQuizData(raw) {
    if (!raw) return [];
    const blocks = raw.split(/\n##\s*/).filter(Boolean);
    return blocks.map((block) => {
      const lines = block.trim().split("\n");
      let question = lines[0].replace(/^##\s*/, "").trim();
      const label = question.toLowerCase();
      if (label === "question" || label === "q" || label === "quiz") {
        question = lines.slice(1).find((l) => l.trim()) || "";
        question = question.trim();
      }
      const options = [];
      let correct = -1;
      let explanation = "";
      let optIdx = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^-\s*\[.\]/.test(line)) {
          const marker = line[3];
          const text = line.slice(5).trim();
          const letters = "ABCDEFGH";
          options.push({ letter: letters[optIdx] || "", text });
          if (marker.toUpperCase() === "X") correct = optIdx;
          optIdx++;
        } else if (/^Correct:\s*([A-D])/i.test(line)) {
          const match = line.match(/^Correct:\s*([A-D])/i);
          if (match) correct = match[1].toUpperCase().charCodeAt(0) - 65;
        } else if (/^Explanation:/i.test(line)) {
          explanation = line.replace(/^Explanation:\s*/i, "").trim();
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
    const segments = question && question.quiz_segments && question.quiz_segments.length ? question.quiz_segments : null;
    const items = segments ? segments.filter((s) => s.t === "question").map((s) => ({
      question: s.title || "",
      body: s.body || "",
      options: (s.options || []).map((o, i) => ({ letter: o.letter || String.fromCharCode(65 + i), text: o.html || "" })),
      correct: typeof s.correct === "number" ? s.correct : -1,
      explanation: s.explanation || "",
      rich: true
    })) : parseQuizData(quizRaw);
    if (items.length === 0) {
      quizContentEl.innerHTML = '<p class="text-muted">No quiz available for this lesson.</p>';
      return;
    }
    const quizId = activeQuestionId || "quiz-unknown";
    const savedResults = quizResults[quizId] || {};
    const optionHtml = (item, opt, oi, qi2) => {
      const wasCorrect = savedResults[qi2] === true;
      const isSelected = wasCorrect && oi === item.correct;
      const text = item.rich ? opt.text : escapeHtml(opt.text);
      return `
      <label class="quiz-option d-block py-1 px-2 mb-1${wasCorrect && isSelected ? " quiz-option-correct" : ""}" data-qi="${qi2}" data-oi="${oi}">
        <input type="radio" name="quiz-${qi2}" value="${oi}" class="me-2"
          ${wasCorrect ? "disabled" : ""}
          ${wasCorrect && isSelected ? "checked" : ""}>
        <span class="option-letter">${opt.letter}.</span> ${text}
      </label>`;
    };
    const questionHtml = (item, qi2) => {
      const wasCorrect = savedResults[qi2] === true;
      const title = item.rich ? item.question : escapeHtml(item.question);
      const explanation = wasCorrect ? '<span class="fw-semibold text-pass">&#10003; Correct!</span> ' + (item.rich ? item.explanation : escapeHtml(item.explanation)) : "";
      return `
      <div class="quiz-question mb-4" data-q="${qi2}" data-solved="${wasCorrect ? "true" : ""}">
        <p class="fw-semibold mb-2">${title}</p>
        ${item.rich && item.body ? `<div class="quiz-question-body mb-2">${item.body}</div>` : ""}
        <div class="quiz-options">
          ${item.options.map((opt, oi) => optionHtml(item, opt, oi, qi2)).join("")}
        </div>
        <div class="quiz-feedback mt-1 small ${wasCorrect ? "" : "d-none"}">${explanation}</div>
      </div>`;
    };
    let qi = 0;
    const contentHtml = segments ? segments.map((seg) => seg.t === "prose" ? `<div class="quiz-prose mb-3">${seg.h}</div>` : questionHtml(items[qi], qi++)).join("") : items.map((item, i) => questionHtml(item, i)).join("");
    quizContentEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="small text-muted">Quiz: ${escapeHtml(question.title)}</span>
      <button id="resetQuizBtn" class="btn btn-sm btn-outline-secondary">Reset Quiz</button>
    </div>
    ${contentHtml}`;
    if (segments) {
      enhanceCodeBlocks(quizContentEl);
      enhanceImages(quizContentEl);
      initImageZoom(quizContentEl);
      embedYouTubeLinks(quizContentEl);
      initVimeoPlayers(quizContentEl);
    }
    function saveQuizResults() {
      try {
        localStorage.setItem("pyjamacode-quiz-results", JSON.stringify(quizResults));
      } catch (e) {
      }
      _dirtyQuizzes[quizId] = true;
      addDirtyId(quizId);
      bumpLocalVersion();
      updateSyncIndicator();
    }
    quizContentEl.querySelectorAll('.quiz-option input[type="radio"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        if (!requireAuth()) {
          e.target.checked = false;
          return;
        }
        const label = e.target.closest(".quiz-option");
        const qi2 = parseInt(label.dataset.qi);
        const oi = parseInt(label.dataset.oi);
        const item = items[qi2];
        const qDiv = quizContentEl.querySelector(`.quiz-question[data-q="${qi2}"]`);
        const feedback = qDiv.querySelector(".quiz-feedback");
        const allLabels = qDiv.querySelectorAll(".quiz-option");
        if (qDiv.dataset.solved === "true") return;
        allLabels.forEach((l) => {
          l.classList.remove("quiz-option-correct", "quiz-option-wrong");
        });
        feedback.classList.add("d-none");
        if (oi === item.correct) {
          label.classList.add("quiz-option-correct");
          allLabels.forEach((l) => l.querySelector("input").disabled = true);
          qDiv.dataset.solved = "true";
          if (!quizResults[quizId]) quizResults[quizId] = {};
          quizResults[quizId][qi2] = true;
          saveQuizResults();
          renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
          feedback.className = "quiz-feedback mt-1 small text-pass";
          feedback.innerHTML = '<span class="fw-semibold">&#10003; Correct!</span> ' + escapeHtml(item.explanation);
          feedback.classList.remove("d-none");
        } else {
          label.classList.add("quiz-option-wrong");
          const nudges = [
            "Not quite. Look at each option carefully \u2014 which one matches the definition we explored?",
            "Close, but not right. Compare the options against what you know about this concept.",
            "Almost there. Think about which option best fits the description from the lesson.",
            "Not this one. Try eliminating the options you know are wrong first.",
            "Hmm, not quite. Re-read the question and consider each choice on its own merits.",
            "Good attempt! Now think about why your choice doesn't fit \u2014 what would need to be true for it to be correct?"
          ];
          feedback.className = "quiz-feedback mt-1 small text-fail";
          feedback.innerHTML = '<span class="fw-semibold">&#10007;</span> ' + nudges[qi2 % nudges.length];
          feedback.classList.remove("d-none");
        }
      });
    });
    const resetBtn2 = document.getElementById("resetQuizBtn");
    if (resetBtn2) {
      resetBtn2.addEventListener("click", () => {
        delete quizResults[quizId];
        saveQuizResults();
        renderQuiz();
        renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
      });
    }
  }
  function saveActiveTab(pid, tab) {
    if (!pid) return;
    var tabs = {};
    try {
      tabs = JSON.parse(localStorage.getItem("pyjamacode-tabs") || "{}");
    } catch (e) {
      tabs = {};
    }
    if (tabs[pid] === tab) return;
    tabs[pid] = tab;
    localStorage.setItem("pyjamacode-tabs", JSON.stringify(tabs));
  }
  function getSavedTab(pid) {
    if (!pid) return null;
    try {
      var tabs = JSON.parse(localStorage.getItem("pyjamacode-tabs") || "{}");
      return tabs[pid] || null;
    } catch (e) {
      return null;
    }
  }
  function buildTabsMap() {
    var tabs = {};
    try {
      tabs = JSON.parse(localStorage.getItem("pyjamacode-tabs") || "{}");
    } catch (e) {
      tabs = {};
    }
    return tabs;
  }
  function setActiveTab(tab) {
    if (questionContentEl) questionContentEl.classList.toggle("d-none", tab !== "challenge");
    if (articleContentEl) articleContentEl.classList.toggle("d-none", tab !== "explanation");
    if (readingTabContentEl) readingTabContentEl.classList.toggle("d-none", tab !== "reading");
    if (quizContentEl) quizContentEl.classList.toggle("d-none", tab !== "quiz");
    if (tabChallenge) tabChallenge.classList.toggle("active", tab === "challenge");
    if (tabArticle) tabArticle.classList.toggle("active", tab === "explanation");
    if (tabReading) tabReading.classList.toggle("active", tab === "reading");
    if (tabQuiz) tabQuiz.classList.toggle("active", tab === "quiz");
    if (tab === "quiz") renderQuiz();
    updateAuthBlur();
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    try {
      history.replaceState(null, "", url.toString());
    } catch (e) {
    }
    saveActiveTab(activeQuestionId, tab);
    setTimeout(() => {
      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }
  function initTypedTitle() {
    const typedEl = document.getElementById("typedTitle");
    if (!typedEl || typeof Typed === "undefined") return;
    const title = typedEl.textContent || "";
    if (window.location.pathname === "/" || window.location.pathname === "") {
      typedEl.textContent = "";
      new Typed("#typedTitle", {
        strings: [title],
        typeSpeed: 60,
        loop: false,
        showCursor: true,
        cursorChar: "_"
      });
    } else {
      typedEl.textContent = title;
      typedEl.innerHTML = title + '<span class="typed-cursor typed-cursor--blink" aria-hidden="true">_</span>';
    }
  }
  function enhanceImages(root) {
    if (!root) return;
    let figureCounter = 0;
    root.querySelectorAll("p > img").forEach((img) => {
      const p = img.parentElement;
      if (p.children.length !== 1) return;
      figureCounter++;
      let alt = (img.alt || "").trim();
      const quotePairs = [["\u201C", "\u201D"], ["\u2018", "\u2019"], ['"', '"'], ["'", "'"]];
      for (let i = 0; i < quotePairs.length; i++) {
        const open = quotePairs[i][0], close = quotePairs[i][1];
        if (alt.length > 1 && alt.charAt(0) === open && alt.charAt(alt.length - 1) === close) {
          alt = alt.slice(1, -1).trim();
          break;
        }
      }
      const figure = document.createElement("figure");
      figure.className = "cb-figure";
      figure.appendChild(img);
      if (alt) {
        const cap = document.createElement("figcaption");
        cap.className = "cb-figure-caption";
        const anchor = document.createElement("a");
        anchor.className = "cb-figure-link";
        const slug = slugify(alt);
        anchor.id = "figure-" + figureCounter + (slug ? "-" + slug : "");
        anchor.href = "#" + anchor.id;
        anchor.textContent = "Figure " + figureCounter + ". " + alt;
        cap.appendChild(anchor);
        figure.appendChild(cap);
      }
      p.parentElement.replaceChild(figure, p);
    });
  }
  function initImageZoom(root) {
    if (!root) return;
    root.querySelectorAll("figure img").forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const overlay = document.getElementById("imageZoomOverlay");
        const zoomImg = document.getElementById("imageZoomImg");
        zoomImg.src = img.src;
        zoomImg.alt = img.alt;
        overlay.style.display = "flex";
      });
    });
  }
  function applyAuthGates(container) {
    if (!container) return false;
    const html = container.innerHTML;
    const openTag = "<!--gated-->";
    const closeTag = "<!--/gated-->";
    if (html.indexOf(openTag) === -1) return false;
    container.innerHTML = "";
    let remaining = html;
    let lastEnd = 0;
    const authed = isAuthenticated();
    const addFragment = (text) => {
      if (!text) return;
      const div = document.createElement("div");
      div.innerHTML = text;
      while (div.firstChild) container.appendChild(div.firstChild);
    };
    while (true) {
      const start = remaining.indexOf(openTag, lastEnd);
      if (start === -1) break;
      const end = remaining.indexOf(closeTag, start + openTag.length);
      if (end === -1) break;
      addFragment(remaining.slice(lastEnd, start));
      const gatedContent = remaining.slice(start + openTag.length, end);
      const gatedDiv = document.createElement("div");
      gatedDiv.style.position = "relative";
      const blurInner = document.createElement("div");
      blurInner.className = "auth-gated";
      blurInner.innerHTML = gatedContent;
      gatedDiv.appendChild(blurInner);
      const overlay = document.createElement("div");
      overlay.className = "gated-overlay";
      overlay.innerHTML = `<p>Sign in to access the content, save progress and execute code.</p><button class="btn btn-sm btn-primary" onclick="if(typeof openAuthModal==='function')openAuthModal('signin')">Sign in</button>`;
      gatedDiv.appendChild(overlay);
      container.appendChild(gatedDiv);
      blurInner.classList.toggle("content-blurred-force", !authed);
      overlay.classList.toggle("show", !authed);
      lastEnd = end + closeTag.length;
    }
    addFragment(remaining.slice(lastEnd));
    if (!window._gateGuard) {
      var _gating = false;
      window._gateGuard = new MutationObserver(function() {
        if (_gating) return;
        _gating = true;
        document.querySelectorAll(".gated-overlay").forEach(function(overlay) {
          if (!document.body.contains(overlay)) {
            var parent = overlay.closest('[style*="position: relative"]');
            if (parent) {
              var blurInner = parent.querySelector(".auth-gated");
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
    root.querySelectorAll("p, div, li").forEach((el) => {
      el.childNodes.forEach((node) => {
        if (node.nodeType === 3 && node.textContent) {
          const m = node.textContent.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
          if (m) {
            const span = document.createElement("span");
            span.innerHTML = '<br><div class="ratio ratio-16x9 my-3"><iframe src="https://www.youtube.com/embed/' + m[1] + '" allowfullscreen></iframe></div><br>';
            node.parentNode.replaceChild(span, node);
          }
        }
      });
    });
  }
  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }
  function enhanceCodeBlocks(root, opts) {
    const skipCaption = opts && opts.skipCaption;
    if (!root) return;
    let listingCounter = 0;
    const blocks = root.querySelectorAll("pre > code");
    blocks.forEach((codeEl) => {
      const pre = codeEl.parentElement;
      if (pre.classList.contains("cm-wrapper")) return;
      listingCounter++;
      const lang = extractLanguage(codeEl);
      const langId = extractLangId(codeEl) || "c";
      const fileAttr = codeEl.getAttribute("data-file") || pre.getAttribute("data-file") || "";
      const captionText = codeEl.getAttribute("data-caption") || pre.getAttribute("data-caption") || "";
      const runCmd = pre.getAttribute("data-cmd") || "";
      const canRun = false;
      const titleText = fileAttr || lang;
      const runFile = fileAttr || "main." + langId;
      const rawCode = codeEl.textContent || "";
      if (typeof hljs !== "undefined") {
        hljs.highlightElement(codeEl);
      }
      const html = codeEl.innerHTML;
      const lineHtmls = html.split(/\n/);
      const lineCount = lineHtmls.length;
      let numberedHtml = "";
      for (let i = 0; i < lineCount; i++) {
        const lineNum = i + 1;
        numberedHtml += `<div class="cb-line" data-line="${lineNum}">`;
        numberedHtml += `<span class="cb-ln">${lineNum}</span>`;
        numberedHtml += `<span class="cb-code">${lineHtmls[i] || " "}</span>`;
        numberedHtml += `</div>`;
      }
      codeEl.innerHTML = numberedHtml;
      const wrapper = document.createElement("div");
      wrapper.className = "cb-wrapper";
      const anchorSlug = slugify(captionText || fileAttr);
      const listingId = "listing-" + listingCounter + (anchorSlug ? "-" + anchorSlug : "");
      const titleBar = document.createElement("div");
      titleBar.className = "cb-titlebar";
      const titleSpan = document.createElement("span");
      titleSpan.className = "cb-title";
      titleSpan.textContent = titleText;
      titleBar.appendChild(titleSpan);
      const actions = document.createElement("span");
      actions.className = "cb-actions";
      titleBar.appendChild(actions);
      if (canRun) {
        const runBtn2 = document.createElement("button");
        runBtn2.className = "cb-copy";
        runBtn2.innerHTML = '<i class="bi bi-play-fill"></i> Run';
        const resetBtn2 = document.createElement("button");
        resetBtn2.className = "cb-copy";
        resetBtn2.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Reset';
        actions.appendChild(runBtn2);
        actions.appendChild(resetBtn2);
        titleBar._runBtn = runBtn2;
        titleBar._resetBtn = resetBtn2;
      } else {
        const copyBtn = document.createElement("button");
        copyBtn.className = "cb-copy";
        copyBtn.textContent = "Copy";
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(rawCode).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => {
              copyBtn.textContent = "Copy";
            }, 2e3);
          });
        });
        actions.appendChild(copyBtn);
      }
      wrapper.appendChild(titleBar);
      const codeArea = document.createElement("div");
      codeArea.className = "cb-code-area";
      codeArea.appendChild(codeEl);
      wrapper.appendChild(codeArea);
      if (canRun) {
        const outPanel = document.createElement("div");
        outPanel.className = "cb-output d-none";
        outPanel.innerHTML = '<div class="cb-output-head"><span class="cb-output-toggle"><i class="bi bi-chevron-down"></i> Output</span><button type="button" class="cb-output-close" aria-label="Hide output"><i class="bi bi-x-lg"></i></button></div><pre class="cb-output-body"></pre>';
        wrapper.appendChild(outPanel);
        const outBody = outPanel.querySelector(".cb-output-body");
        outPanel.querySelector(".cb-output-head").addEventListener("click", (e) => {
          if (e.target.closest(".cb-output-close")) return;
          outPanel.classList.toggle("collapsed");
        });
        outPanel.querySelector(".cb-output-close").addEventListener("click", () => {
          outPanel.classList.add("d-none");
        });
        const runBtn2 = titleBar._runBtn;
        const resetBtn2 = titleBar._resetBtn;
        runBtn2.addEventListener("click", () => {
          if (!requireAuthForRun()) {
            outPanel.classList.remove("d-none", "collapsed");
            outBody.innerHTML = '<span class="text-fail">Sign in to run code.</span>';
            return;
          }
          outPanel.classList.remove("d-none", "collapsed");
          outBody.innerHTML = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) + "\nRunning...";
          runBtn2.disabled = true;
          fetch(JUDGE_URL + "/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ files: [{ name: runFile, content: rawCode }], command: runCmd })
          }).then((r) => r.json()).then((res) => {
            const body = (res.stdout || "") + (res.stderr || "");
            let html2 = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) + "\n";
            html2 += ansiToHtml(body) || '<span class="text-muted">(no output)</span>';
            if (res.timedOut) html2 += '\n<small class="text-muted">Timed out</small>';
            outBody.innerHTML = html2;
          }).catch((err) => {
            outBody.innerHTML = '<span class="cb-prompt">$</span> ' + escapeHtml(runCmd) + '\n<span class="text-fail">Connection error</span>\n' + escapeHtml(err.message || "");
          }).then(() => {
            runBtn2.disabled = false;
          });
        });
        resetBtn2.addEventListener("click", () => {
          outBody.textContent = "";
          outPanel.classList.add("d-none");
        });
      }
      const caption = skipCaption ? "" : "Listing " + listingCounter + (captionText ? ". " + captionText : fileAttr ? ". " + fileAttr : ".");
      pre.parentElement.replaceChild(wrapper, pre);
      if (caption) {
        const captionEl = document.createElement("div");
        captionEl.className = "cb-note";
        const anchor = document.createElement("a");
        anchor.className = "cb-listing-link";
        anchor.id = listingId;
        anchor.href = "#" + listingId;
        anchor.textContent = caption;
        captionEl.appendChild(anchor);
        wrapper.after(captionEl);
      }
    });
    root.querySelectorAll(".cb-line").forEach((line) => {
      line.addEventListener("click", (e) => {
        if (e.target.closest(".cb-ln")) return;
        if (window.getSelection().toString().length > 0) return;
        const wasActive = line.classList.contains("active");
        const parent = line.closest(".cb-code-area");
        if (parent) {
          parent.querySelectorAll(".cb-line.active").forEach((l) => l.classList.remove("active"));
        }
        if (!wasActive) {
          line.classList.add("active");
        }
      });
    });
  }
  function extractLanguage(codeEl) {
    for (const cls of codeEl.classList) {
      if (cls.startsWith("language-")) {
        let lang = cls.slice(9);
        const map = {
          c: "C",
          cpp: "C++",
          cs: "C#",
          js: "JavaScript",
          ts: "TypeScript",
          py: "Python",
          rb: "Ruby",
          go: "Go",
          rs: "Rust",
          asm: "Assembly",
          gas: "Assembly",
          bash: "Bash",
          sh: "Shell",
          makefile: "Makefile",
          text: "Text",
          plaintext: "Text",
          html: "HTML",
          css: "CSS",
          json: "JSON",
          xml: "XML",
          yaml: "YAML",
          toml: "TOML",
          md: "Markdown",
          markdown: "Markdown",
          sql: "SQL",
          diff: "Diff"
        };
        return map[lang] || lang.toUpperCase();
      }
    }
    return "";
  }
  function initProblemNav() {
    const prevBtn = document.getElementById("prevProblemBtn");
    const nextBtn = document.getElementById("nextProblemBtn");
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
          const skA = topic + "/" + a;
          const skB = topic + "/" + b;
          return (getSubtopicWeight(skA) ?? 99) - (getSubtopicWeight(skB) ?? 99);
        });
        subKeys.forEach((sub) => {
          const qs = [...subtopics[sub]].sort(
            (a, b) => getWeight(a, "weight", 99) - getWeight(b, "weight", 99)
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
          const tw = getWeight(q, "topic_weight", 99);
          if (w === void 0 || tw < w) w = tw;
        }
      });
      return w;
    }
    function getGroupWeight(topic) {
      const gs = groupsForTopic(topic);
      if (!gs.length) return void 0;
      return gs.reduce((min, g) => Math.min(min, g.weight ?? 99), 99);
    }
    function getSubtopicWeight(key) {
      let w;
      questions.forEach((q) => {
        const sk = q.topic + "/" + q.subtopic;
        if (sk === key) {
          const sw = getWeight(q, "subtopic_weight", 99);
          if (w === void 0 || sw < w) w = sw;
        }
      });
      return w;
    }
    function getAvailableTabs() {
      const pairs = [
        ["explanation", tabArticle],
        ["reading", tabReading],
        ["quiz", tabQuiz],
        ["challenge", tabChallenge]
      ];
      return pairs.filter(([, el]) => el && !el.classList.contains("d-none")).map(([name]) => name);
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
      const currentTab = getActiveTabName();
      const available = getAvailableTabs();
      const currentTabIdx = available.indexOf(currentTab);
      if (currentTabIdx === -1) {
        const target = idx + dir;
        if (target < 0 || target >= flat.length) return;
        selectQuestion(flat[target].id);
        return;
      }
      const nextTabIdx = currentTabIdx + dir;
      if (nextTabIdx >= 0 && nextTabIdx < available.length) {
        setActiveTab(available[nextTabIdx]);
      } else {
        const target = idx + dir;
        if (target < 0 || target >= flat.length) return;
        selectQuestion(flat[target].id);
      }
    };
    function getActiveTabName() {
      if (tabArticle && tabArticle.classList.contains("active")) return "explanation";
      if (tabReading && tabReading.classList.contains("active")) return "reading";
      if (tabQuiz && tabQuiz.classList.contains("active")) return "quiz";
      if (articleContentEl && !articleContentEl.classList.contains("d-none")) return "explanation";
      if (readingTabContentEl && !readingTabContentEl.classList.contains("d-none")) return "reading";
      if (quizContentEl && !quizContentEl.classList.contains("d-none")) return "quiz";
      return "challenge";
    }
    prevBtn.addEventListener("click", () => navigate(-1));
    nextBtn.addEventListener("click", () => navigate(1));
  }
  function initSidebarToggle() {
    const hideBtn = document.getElementById("sidebarHideBtn");
    const showBtn = document.getElementById("sidebarShowBtn");
    const closeBtn = document.getElementById("sidebarCloseBtn");
    const sidebar = document.getElementById("sidebarPane");
    const body = document.body;
    if (!hideBtn || !showBtn || !sidebar) return;
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }
    function isMobile() {
      const bp = window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint || 800;
      return window.innerWidth <= bp;
    }
    function updateUI(collapsed) {
      if (isMobile()) {
        sidebar.classList.toggle("sidebar-open", !collapsed);
        backdrop.classList.toggle("show", !collapsed);
        showBtn.classList.toggle("d-none", !collapsed);
        hideBtn.classList.add("d-none");
        if (closeBtn) closeBtn.classList.toggle("d-none", collapsed);
      } else {
        body.classList.toggle("sidebar-collapsed", collapsed);
        hideBtn.classList.toggle("d-none", collapsed);
        showBtn.classList.toggle("d-none", !collapsed);
        sidebar.style.width = "";
        sidebar.classList.remove("sidebar-open");
        backdrop.classList.remove("show");
        if (closeBtn) closeBtn.classList.add("d-none");
      }
      hideBtn.setAttribute("title", collapsed ? "Show sidebar" : "Collapse sidebar");
      showBtn.setAttribute("title", collapsed ? "Show sidebar" : "Collapse sidebar");
    }
    if (!isMobile() && localStorage.getItem("sidebarCollapsed") === "true") {
      updateUI(true);
    }
    function toggle() {
      const isCollapsed = isMobile() ? !sidebar.classList.contains("sidebar-open") : body.classList.contains("sidebar-collapsed");
      updateUI(!isCollapsed);
      if (!isMobile()) localStorage.setItem("sidebarCollapsed", !isCollapsed);
      [hideBtn, showBtn].forEach((btn) => {
        if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
          const tp = bootstrap.Tooltip.getInstance(btn);
          if (tp) tp.hide();
        }
      });
      setTimeout(() => {
        if (codeMirror) codeMirror.refresh();
      }, 250);
    }
    hideBtn.addEventListener("click", toggle);
    showBtn.addEventListener("click", toggle);
    if (closeBtn) closeBtn.addEventListener("click", toggle);
    backdrop.addEventListener("click", () => {
      if (isMobile()) {
        sidebar.classList.remove("sidebar-open");
        backdrop.classList.remove("show");
        showBtn.classList.remove("d-none");
      }
    });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isMobile()) {
          sidebar.classList.remove("sidebar-open");
          backdrop.classList.remove("show");
          hideBtn.classList.add("d-none");
          showBtn.classList.remove("d-none");
        } else {
          sidebar.classList.remove("sidebar-open");
          backdrop.classList.remove("show");
          const wasCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
          if (wasCollapsed) {
            body.classList.add("sidebar-collapsed");
            hideBtn.classList.add("d-none");
            showBtn.classList.remove("d-none");
          } else {
            body.classList.remove("sidebar-collapsed");
            hideBtn.classList.remove("d-none");
            showBtn.classList.add("d-none");
          }
        }
        if (closeBtn) closeBtn.classList.toggle("d-none", !isMobile());
      }, 200);
    });
    if (isMobile()) {
      sidebar.classList.remove("sidebar-open");
      backdrop.classList.remove("show");
      hideBtn.classList.add("d-none");
      showBtn.classList.remove("d-none");
      if (closeBtn) closeBtn.classList.remove("d-none");
    }
  }
  function initVimeoPlayers(root) {
    if (!root) return;
    root.querySelectorAll(".vm-wrapper").forEach((wrapper) => {
      if (wrapper.dataset.vmInit) return;
      wrapper.dataset.vmInit = "1";
      const videoId = wrapper.dataset.videoId;
      const thumb = wrapper.querySelector(".vm-thumb");
      const playerDiv = wrapper.querySelector(".vm-player");
      const shield = wrapper.querySelector(".vm-shield");
      const controls = wrapper.querySelector(".vm-controls");
      const playBtn = controls ? controls.querySelector(".vmc-play i") : null;
      const muteBtn = controls ? controls.querySelector(".vmc-mute i") : null;
      const fsBtn = controls ? controls.querySelector(".vmc-fs") : null;
      const fill = controls ? controls.querySelector(".vmc-fill") : null;
      const currentEl = controls ? controls.querySelector(".vmc-current") : null;
      const durationEl = controls ? controls.querySelector(".vmc-duration") : null;
      const track = controls ? controls.querySelector(".vmc-track") : null;
      if (!videoId) return;
      let player = null;
      let seeking = false;
      const show = () => {
        playerDiv.style.display = "block";
        if (shield) shield.style.display = "block";
        if (controls) controls.style.display = "flex";
        const img = thumb.querySelector("img");
        const pbtn = thumb.querySelector(".vm-playbtn");
        if (img) img.style.display = "none";
        if (pbtn) pbtn.style.display = "none";
        const iframe = playerDiv.querySelector("iframe");
        if (typeof Vimeo !== "undefined" && Vimeo.Player) {
          player = new Vimeo.Player(iframe);
          player.setVolume(1);
          player.play();
          player.on("play", () => {
            if (controls) {
              controls.style.opacity = "1";
              controls.classList.add("vm-controls-show");
            }
            if (playBtn) playBtn.className = "bi bi-pause-fill";
            startProgress();
            hideControlsAfterDelay();
          });
          player.on("pause", () => {
            if (playBtn) playBtn.className = "bi bi-play-fill";
            stopProgress();
            if (controls) controls.style.opacity = "1";
          });
          player.on("ended", () => {
            if (playBtn) playBtn.className = "bi bi-play-fill";
            stopProgress();
            if (controls) controls.style.opacity = "1";
          });
          player.on("timeupdate", (data) => {
            if (seeking) return;
            const pct = data.percent * 100;
            if (fill) fill.style.width = pct + "%";
            if (currentEl) currentEl.textContent = formatTimeV(data.seconds);
          });
          player.getDuration().then((d) => {
            if (durationEl) durationEl.textContent = formatTimeV(d);
          });
        }
      };
      wrapper.addEventListener("click", (e) => {
        if (e.target.closest(".vmc-btn") || e.target.closest(".vmc-track")) return;
        if (player) {
          player.getPaused().then((p) => {
            if (p) player.play();
            else player.pause();
          });
        } else {
          show();
        }
      });
      if (playBtn) {
        playBtn.closest(".vmc-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          if (player) {
            player.getPaused().then((p) => {
              if (p) player.play();
              else player.pause();
            });
          } else {
            show();
          }
        });
      }
      if (muteBtn) {
        muteBtn.closest(".vmc-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          if (player) {
            player.getVolume().then((v) => {
              if (v > 0) {
                player.setVolume(0);
                muteBtn.className = "bi bi-volume-mute-fill";
              } else {
                player.setVolume(1);
                muteBtn.className = "bi bi-volume-up-fill";
              }
            });
          }
        });
      }
      if (fsBtn) {
        fsBtn.closest(".vmc-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          if (document.fullscreenElement) document.exitFullscreen();
          else wrapper.requestFullscreen();
        });
      }
      const qualityMenu = wrapper.querySelector(".vmc-quality-menu");
      const qualityBtn = wrapper.querySelector(".vmc-quality-btn");
      if (qualityBtn && qualityMenu) {
        const content = qualityMenu.querySelector(".vmc-dropdown-content");
        qualityBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = content.style.display === "block";
          wrapper.querySelectorAll(".vmc-dropdown-content").forEach((c) => c.style.display = "none");
          if (!isOpen && player) content.style.display = "block";
        });
        wrapper.addEventListener("click", () => {
          if (content) content.style.display = "none";
        });
        if (player) {
          player.getQualities().then((qs) => {
            if (qs.length > 1) {
              content.innerHTML = qs.map((q) => {
                const label = q.label || q.id;
                const active = q.active ? "active" : "";
                return '<a data-quality="' + q.id + '" class="' + active + '">' + label + "</a>";
              }).join("");
              content.querySelectorAll("a").forEach((el) => {
                el.addEventListener("click", (e) => {
                  e.stopPropagation();
                  player.setQuality(el.dataset.quality);
                  content.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
                  el.classList.add("active");
                  qualityBtn.textContent = el.textContent;
                  content.style.display = "none";
                });
              });
            } else {
              qualityMenu.style.display = "none";
            }
          });
        }
      }
      const speedMenu = wrapper.querySelector(".vmc-speed-menu");
      const speedBtn = wrapper.querySelector(".vmc-speed-btn");
      if (speedBtn && speedMenu) {
        const content = speedMenu.querySelector(".vmc-dropdown-content");
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        content.innerHTML = speeds.map((s) => {
          const active = s === 1 ? "active" : "";
          return '<a data-speed="' + s + '" class="' + active + '">' + s + "x</a>";
        }).join("");
        speedBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = content.style.display === "block";
          wrapper.querySelectorAll(".vmc-dropdown-content").forEach((c) => c.style.display = "none");
          if (!isOpen && player) content.style.display = "block";
        });
        content.querySelectorAll("a").forEach((el) => {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            const speed = parseFloat(el.dataset.speed);
            if (player) player.setPlaybackRate(speed);
            content.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
            el.classList.add("active");
            speedBtn.textContent = speed + "x";
            content.style.display = "none";
          });
        });
      }
      if (track) {
        track.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          seeking = true;
          seekV(e);
          const onMove = (ev) => seekV(ev);
          const onUp = () => {
            seeking = false;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        });
      }
      let ctrlTimer = null;
      const showControlsFade = () => {
        if (controls && controls.style.display !== "none") {
          controls.style.opacity = "1";
          clearTimeout(ctrlTimer);
          if (player) {
            player.getPaused().then((p) => {
              if (!p) ctrlTimer = setTimeout(() => {
                if (controls) controls.style.opacity = "0";
              }, 3e3);
            }).catch(() => {
            });
          }
        }
      };
      wrapper.addEventListener("mousemove", showControlsFade);
      function hideControlsAfterDelay() {
        clearTimeout(ctrlTimer);
        ctrlTimer = setTimeout(() => {
          if (controls) controls.style.opacity = "0";
        }, 3e3);
      }
      function clearControlsTimer() {
        if (ctrlTimer) {
          clearTimeout(ctrlTimer);
          ctrlTimer = null;
        }
      }
      function seekV(e) {
        if (!player || !track) return;
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        player.setCurrentTime(pct * 1);
        player.getDuration().then((d) => {
          player.setCurrentTime(pct * d);
        });
      }
      let progInterval = null;
      function startProgress() {
        stopProgress();
        progInterval = setInterval(() => {
          if (!player || !fill || !currentEl) return;
          if (seeking) return;
          player.getCurrentTime().then((ct) => {
            player.getDuration().then((d) => {
              if (d > 0) fill.style.width = ct / d * 100 + "%";
              currentEl.textContent = formatTimeV(ct);
            });
          });
        }, 200);
      }
      function stopProgress() {
        if (progInterval) {
          clearInterval(progInterval);
          progInterval = null;
        }
      }
    });
  }
  function formatTimeV(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function ansiToHtml(text) {
    if (!text) return "";
    let s = text.split("\n").map((l) => {
      const p = l.split("\r");
      return p[p.length - 1];
    }).join("\n");
    s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\t/g, "  ");
    const AN = {
      1: [0, "b"],
      3: [0, "i"],
      4: [0, "u"],
      30: [1, 0],
      31: [1, 1],
      32: [1, 2],
      33: [1, 3],
      34: [1, 4],
      35: [1, 5],
      36: [1, 6],
      37: [1, 7],
      90: [1, 8],
      91: [1, 9],
      92: [1, 10],
      93: [1, 11],
      94: [1, 12],
      95: [1, 13],
      96: [1, 14],
      97: [1, 15],
      40: [2, 0],
      41: [2, 1],
      42: [2, 2],
      43: [2, 3],
      44: [2, 4],
      45: [2, 5],
      46: [2, 6],
      47: [2, 7],
      100: [2, 8],
      101: [2, 9],
      102: [2, 10],
      103: [2, 11],
      104: [2, 12],
      105: [2, 13],
      106: [2, 14],
      107: [2, 15]
    };
    const STYLES = [
      "",
      "font-weight:bold",
      "font-style:italic",
      "text-decoration:underline"
    ];
    const re = /\x1b\[([0-9;]*)m/g;
    let out = "", last = 0, state = {}, open = false, m;
    while ((m = re.exec(s)) !== null) {
      out += s.slice(last, m.index);
      if (open) {
        out += "</span>";
        open = false;
      }
      const codes = m[1] ? m[1].split(";") : ["0"];
      for (const c of codes) {
        if (c === "0" || c === "") {
          state = {};
        } else if (AN[c]) {
          const [type, val] = AN[c];
          if (type === 0) state["s" + val] = true;
          else if (type === 1) state.fg = val;
          else if (type === 2) state.bg = val;
        }
      }
      const parts = [];
      if (state.sb) parts.push(STYLES[1]);
      if (state.si) parts.push(STYLES[2]);
      if (state.su) parts.push(STYLES[3]);
      if (state.fg !== void 0) parts.push("color:var(--ansi-" + state.fg + ")");
      if (state.bg !== void 0) parts.push("background-color:var(--ansi-" + state.bg + ")");
      if (parts.length) {
        out += '<span style="' + parts.join(";") + '">';
        open = true;
      }
      last = m.index + m[0].length;
    }
    out += s.slice(last);
    if (open) out += "</span>";
    return out;
  }
  function extractLangId(codeEl) {
    for (const cls of codeEl.classList) {
      if (cls.startsWith("language-")) return cls.slice(9).toLowerCase();
    }
    return "";
  }
  function collectCodeFiles(html) {
    const files = [];
    if (!html) return files;
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("pre").forEach((pre) => {
      const codeEl = pre.querySelector("code");
      if (!codeEl) return;
      const raw = pre.getAttribute("data-file") || "";
      const lang = extractLangId(codeEl);
      const filename = raw || "untitled." + (lang || "c");
      const content = codeEl.textContent || "";
      files.push({ filename, lang: lang || "c", mode: langToMode(lang || "c"), content });
    });
    return files;
  }
  function buildFileTabs(question) {
    fileList = [];
    activeFileIndex = 0;
    unsavedFiles = {};
    const starterHtml = (question.content || "") + (question.article || "");
    if (starterHtml.indexOf("data-starter") !== -1) {
      const div = document.createElement("div");
      div.innerHTML = starterHtml;
      div.querySelectorAll("pre[data-starter]").forEach((pre) => {
        const codeEl = pre.querySelector("code");
        if (!codeEl) return;
        const raw = pre.getAttribute("data-file") || "";
        const lang = extractLangId(codeEl);
        const filename = raw || "main.c";
        fileList.push({ filename, lang: lang || "c", mode: langToMode(lang || "c"), content: codeEl.textContent || "" });
      });
    }
    if (fileList.length === 0 && question.codes) {
      fileList = collectCodeFiles(question.codes);
    }
    if (fileTabs) {
      fileTabs.innerHTML = "";
      fileList.forEach((file, idx) => {
        const tab = document.createElement("div");
        tab.className = "file-tab" + (idx === activeFileIndex ? " active" : "");
        const dot = document.createElement("i");
        dot.className = "bi bi-dot";
        dot.style.fontSize = "1em";
        dot.style.verticalAlign = "middle";
        tab.appendChild(dot);
        tab.appendChild(document.createTextNode(file.filename));
        tab.addEventListener("click", () => switchFileTab(idx));
        fileTabs.appendChild(tab);
      });
    }
    if (resetAllBtn) resetAllBtn.classList.toggle("d-none", fileList.length <= 1);
    loadActiveFile(question);
  }
  function loadActiveFile(question) {
    if (!question) return;
    const id = question.id;
    let code = "";
    if (fileList.length > 0) {
      const file = fileList[activeFileIndex];
      const saved = submissions[id]?.files?.[file.filename];
      code = saved || file.content;
      if (languageLabelEl) languageLabelEl.textContent = langToLabel(file.lang);
      updateCodeMirrorMode(file.lang);
    } else {
      const saved = submissions[id]?.code;
      code = saved || "";
      if (languageLabelEl) languageLabelEl.textContent = langToLabel(question.language || "c");
      updateCodeMirrorMode(question.language || "c");
    }
    setEditorValue(code);
  }
  function switchFileTab(idx) {
    if (idx === activeFileIndex) return;
    if (activeQuestionId && fileList.length > 0) {
      const file = fileList[activeFileIndex];
      if (!submissions[activeQuestionId]) submissions[activeQuestionId] = {};
      if (!submissions[activeQuestionId].files) submissions[activeQuestionId].files = {};
      submissions[activeQuestionId].files[file.filename] = getEditorValue();
      delete unsavedFiles[file.filename];
    }
    activeFileIndex = idx;
    if (fileTabs) {
      fileTabs.querySelectorAll(".file-tab").forEach((tab, i) => {
        tab.classList.toggle("active", i === idx);
      });
    }
    const question = questions.find((q) => q.id === activeQuestionId);
    if (question) loadActiveFile(question);
    persistSubmissions();
    refreshFileUnsavedDots();
  }
  function getFilenameForIndex(idx) {
    if (!fileList || idx < 0 || idx >= fileList.length) return null;
    return fileList[idx].filename;
  }
  function showFileUnsavedDot(idx) {
    const name = getFilenameForIndex(idx);
    if (!name) return;
    unsavedFiles[name] = true;
    const tab = fileTabs ? fileTabs.querySelectorAll(".file-tab")[idx] : null;
    if (tab) {
      const dot = tab.querySelector(".bi-dot");
      if (dot) dot.classList.add("d-unsaved");
    }
  }
  function hideFileUnsavedDot() {
    const name = getFilenameForIndex(activeFileIndex);
    if (!name) return;
    delete unsavedFiles[name];
    const tab = fileTabs ? fileTabs.querySelectorAll(".file-tab")[activeFileIndex] : null;
    if (tab) {
      const dot = tab.querySelector(".bi-dot");
      if (dot) dot.classList.remove("d-unsaved");
    }
  }
  function hideAllUnsavedDots() {
    unsavedFiles = {};
    if (!fileTabs) return;
    fileTabs.querySelectorAll(".file-tab .bi-dot").forEach((d) => d.classList.remove("d-unsaved"));
  }
  function refreshFileUnsavedDots() {
    if (!fileTabs) return;
    fileTabs.querySelectorAll(".file-tab").forEach((tab, idx) => {
      const name = getFilenameForIndex(idx);
      const dot = tab.querySelector(".bi-dot");
      if (!dot || !name) return;
      dot.classList.toggle("d-unsaved", !!unsavedFiles[name]);
    });
  }
  function showNotesUnsavedDot() {
    const el = document.getElementById("notesUnsavedDot");
    if (el) el.classList.add("d-unsaved");
  }
  function hideNotesUnsavedDot() {
    const el = document.getElementById("notesUnsavedDot");
    if (el) el.classList.remove("d-unsaved");
  }
  var authMode = "signin";
  var authOverlay = document.getElementById("authOverlay");
  var authModal;
  var authModalTitle;
  var authEmail;
  var authPassword;
  var authActionBtn;
  var authModalCloseBtn;
  var authError;
  var authToggleLink;
  var authToggleText;
  var authGoogleBtn;
  var authCloseLink = null;
  var authShowBtn = document.getElementById("authShowBtn");
  var authLoginBtn = document.getElementById("authLoginBtn");
  var authUserMenu = document.getElementById("authUserMenu");
  var authAvatar = document.getElementById("authAvatar");
  var authUserName = document.getElementById("authUserName");
  var authUserEmail = document.getElementById("authUserEmail");
  var authLogoutLink = document.getElementById("authLogoutLink");
  var resetProfileLink = document.getElementById("resetProfileLink");
  function injectAuthModal() {
    let el = document.getElementById("authModal");
    if (!el) {
      el = document.createElement("div");
      el.id = "authModal";
      el.className = "auth-modal-backdrop";
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
    if (el.parentElement !== document.body) document.body.appendChild(el);
    if (!document.getElementById("authModalClose")) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.id = "authModalClose";
      closeBtn.className = "auth-modal-close";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.innerHTML = "&times;";
      const box = el.querySelector(".auth-modal") || el;
      box.insertBefore(closeBtn, box.firstChild);
    }
    authModal = el;
    authModalCloseBtn = document.getElementById("authModalClose");
    authModalTitle = document.getElementById("authModalTitle");
    authEmail = document.getElementById("authEmail");
    authPassword = document.getElementById("authPassword");
    authActionBtn = document.getElementById("authActionBtn");
    authError = document.getElementById("authError");
    authToggleLink = document.getElementById("authToggleLink");
    authToggleText = document.getElementById("authToggleText");
    authGoogleBtn = document.getElementById("authGoogleBtn");
    if (!el._listenersAttached) {
      el._listenersAttached = true;
      if (authGoogleBtn) authGoogleBtn.addEventListener("click", () => {
        signInWithGoogle().then(() => {
          window.location.reload();
        }).catch((err) => {
          showAuthError(err.message || "Google sign-in failed.");
        });
      });
      if (authActionBtn) authActionBtn.addEventListener("click", handleAuthAction);
      if (authPassword) authPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAuthAction();
      });
      if (authToggleLink) authToggleLink.addEventListener("click", toggleAuthMode);
      if (authModalCloseBtn) authModalCloseBtn.addEventListener("click", () => closeAuthModal());
      el.addEventListener("click", (e) => {
        if (e.target === el && el._backdropClose) closeAuthModal();
      });
    }
    if (!el._tamperObserver) {
      el._tamperObserver = new MutationObserver(() => {
        if (window._authModalOpen && authModalTampered()) forceAuthModalVisible();
      });
      el._tamperObserver.observe(el, { attributes: true, attributeFilter: ["style", "class", "hidden"] });
    }
    if (!window._authModalObserver) {
      window._authModalObserver = new MutationObserver(() => {
        if (window._authModalOpen && !document.getElementById("authModal")) {
          forceAuthModalVisible();
        }
      });
      window._authModalObserver.observe(document.body, { childList: true });
    }
  }
  function toggleAuthMode() {
    injectAuthModal();
    openAuthModal(authMode === "signin" ? "signup" : "signin");
  }
  function maybeSaveProblemUrl(url) {
    if (url && url.includes("/courses/")) {
      localStorage.setItem("lastProblemUrl", url);
      if (activeQuestionId) localStorage.setItem("lastProblemTab", getSavedTab(activeQuestionId) || "");
    }
  }
  (function() {
    maybeSaveProblemUrl(window.location.href);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) maybeSaveProblemUrl(window.location.href);
    });
    window.addEventListener("popstate", () => {
      maybeSaveProblemUrl(window.location.href);
    });
  })();
  function updateAuthGates() {
    const authed = isAuthenticated();
    document.querySelectorAll(".gated-overlay").forEach((overlay) => {
      const gatedDiv = overlay.closest('[style*="position: relative"]');
      const blurInner = gatedDiv ? gatedDiv.querySelector(".auth-gated") : null;
      if (!gatedDiv || !blurInner) return;
      blurInner.classList.toggle("content-blurred-force", !authed);
      overlay.classList.toggle("show", !authed);
    });
  }
  function updateAuthBlur() {
    const ready = typeof isAuthReady === "undefined" ? true : isAuthReady();
    if (!ready) return;
    updateAuthGates();
  }
  function setupAuth() {
    if (typeof onAuthChange === "undefined") return;
    if (authLoginBtn) authLoginBtn.addEventListener("click", () => openAuthModal("signin"));
    if (authLogoutLink) authLogoutLink.addEventListener("click", () => {
      if (typeof saveCurrentNotes === "function") saveCurrentNotes();
      if (typeof saveCurrentCode === "function") saveCurrentCode();
      var flush = typeof window.__cloudSyncNow === "function" ? window.__cloudSyncNow() : Promise.resolve();
      flush.finally(function() {
        localStorage.removeItem("pyjamacode-submissions");
        localStorage.removeItem("pyjamacode-notes");
        localStorage.removeItem("pyjamacode-bookmarks");
        localStorage.removeItem("pyjamacode-quiz-results");
        localStorage.removeItem("pyjamacode-free-used");
        localStorage.removeItem("pyjamacode-tabs");
        localStorage.removeItem("lastProblemUrl");
        localStorage.removeItem("lastProblemTab");
        localStorage.removeItem("pyjamacode-cloud-initialized");
        localStorage.removeItem("pyjamacode-local-version");
        localStorage.removeItem("pyjamacode-synced-version");
        clearDirtyIds();
        try {
          localStorage.removeItem("pyjamacode-session-id");
        } catch (e) {
        }
        signOut().finally(function() {
          location.reload();
        });
      });
    });
    var resetDialog = document.getElementById("resetConfirmModal");
    var resetCodeEl = document.getElementById("resetConfirmCode");
    var resetInput = document.getElementById("resetConfirmInput");
    var resetConfirmYes = document.getElementById("resetConfirmYes");
    var resetConfirmNo = document.getElementById("resetConfirmNo");
    function generateResetCode() {
      return String(Math.floor(1e5 + Math.random() * 9e5));
    }
    function clearLocalProfile2() {
      localStorage.removeItem("pyjamacode-submissions");
      localStorage.removeItem("pyjamacode-notes");
      localStorage.removeItem("pyjamacode-bookmarks");
      localStorage.removeItem("pyjamacode-quiz-results");
      localStorage.removeItem("pyjamacode-free-used");
      localStorage.removeItem("pyjamacode-tabs");
      localStorage.removeItem("lastProblemUrl");
      localStorage.removeItem("lastProblemTab");
      localStorage.removeItem("pyjamacode-cloud-initialized");
      localStorage.removeItem("pyjamacode-local-version");
      localStorage.removeItem("pyjamacode-synced-version");
      clearDirtyIds();
      try {
        localStorage.removeItem("pyjamacode-session-id");
      } catch (e) {
      }
      try {
        localStorage.removeItem("pyjamacode-theme");
      } catch (e) {
      }
    }
    if (resetProfileLink) {
      resetProfileLink.addEventListener("click", function() {
        if (!resetDialog || !resetCodeEl || !resetInput || !resetConfirmYes) return;
        var code = generateResetCode();
        resetCodeEl.textContent = code;
        resetInput.value = "";
        resetConfirmYes.disabled = true;
        resetDialog.showModal();
      });
    }
    if (resetConfirmNo) {
      resetConfirmNo.addEventListener("click", function() {
        if (resetDialog) resetDialog.close();
      });
    }
    if (resetDialog) {
      resetDialog.addEventListener("close", function() {
        if (resetInput) resetInput.value = "";
      });
    }
    if (resetInput) {
      resetInput.addEventListener("input", function() {
        if (!resetConfirmYes || !resetCodeEl) return;
        resetConfirmYes.disabled = resetInput.value !== resetCodeEl.textContent;
      });
    }
    if (resetConfirmYes) {
      resetConfirmYes.addEventListener("click", function() {
        if (resetConfirmYes.disabled) return;
        if (resetDialog) resetDialog.close();
        var uid = null;
        try {
          if (typeof firebase !== "undefined" && firebase.apps.length && firebase.auth().currentUser) {
            uid = firebase.auth().currentUser.uid;
          }
        } catch (e) {
        }
        if (uid) {
          window._wipingUid = uid;
          firebase.firestore().collection("users").doc(uid).collection("meta").doc("profile").set({
            _wipedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).then(function() {
            return deleteUserData(uid);
          }).then(function() {
            clearLocalProfile2();
            window.location.href = "/dashboard/";
          }).catch(function(e) {
            console.error("Failed to delete cloud data:", e);
            clearLocalProfile2();
            window.location.href = "/dashboard/";
          });
        } else {
          clearLocalProfile2();
          window.location.href = "/dashboard/";
        }
      });
    }
    window.addEventListener("storage", function(e) {
      if (e.key === "pyjamacode-wiped-at" && e.newValue) {
        clearLocalProfile2();
        window.location.href = "/dashboard/";
      }
    });
    if (authGoogleBtn) authGoogleBtn.addEventListener("click", () => {
      signInWithGoogle().then(() => {
        window.location.reload();
      }).catch((err) => {
        showAuthError(err.message || "Google sign-in failed.");
      });
    });
    onAuthChange((user) => {
      const isAuthed = user !== null;
      if (isAuthed) {
        if (questionContentEl) questionContentEl.classList.remove("content-blurred-force");
        if (editorArea) editorArea.classList.remove("content-blurred-force");
        if (authCloseLink) authCloseLink.style.display = "";
        if (authModal) authModal._backdropClose = false;
        if (typeof closeAuthModal === "function") closeAuthModal();
        if (typeof hideNotesAuthPrompt === "function") hideNotesAuthPrompt();
        if (typeof clearFreeRuns === "function") clearFreeRuns();
        localStorage.removeItem("authForced");
        localStorage.removeItem("pyjamacode-free-used");
        if (isAuthed && (window.location.pathname === "/" || window.location.pathname === "")) {
          window.location.replace("/dashboard/");
          return;
        }
      }
      if (authLoginBtn) authLoginBtn.classList.toggle("d-none", isAuthed);
      if (authUserMenu) authUserMenu.classList.toggle("d-none", !isAuthed);
      if (user) {
        const name = user.displayName || user.email || "";
        const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();
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
    if (authShowBtn) authShowBtn.addEventListener("click", () => openAuthModal("signin"));
    if (authActionBtn) authActionBtn.addEventListener("click", handleAuthAction);
    if (authPassword) authPassword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAuthAction();
    });
  }
  function authModalClosable() {
    return !!(window.__APP_CONFIG__ && window.__APP_CONFIG__.allowAuthModalClose === true);
  }
  function openAuthModal(mode) {
    injectAuthModal();
    authMode = mode;
    if (authModalTitle) authModalTitle.textContent = mode === "signin" ? "Sign In" : "Sign Up";
    if (authActionBtn) authActionBtn.textContent = mode === "signin" ? "Sign In" : "Sign Up";
    if (authToggleText) authToggleText.textContent = mode === "signin" ? "Don't have an account? " : "Already have an account? ";
    if (authToggleLink) authToggleLink.textContent = mode === "signin" ? "Sign Up" : "Sign In";
    if (authError) authError.style.display = "none";
    if (authEmail) authEmail.value = "";
    if (authPassword) authPassword.value = "";
    if (authModal) authModal.classList.add("show");
    if (authEmail) setTimeout(() => authEmail.focus(), 100);
    if (authModal) {
      authModal._backdropClose = authModalClosable();
      if (authModalCloseBtn) authModalCloseBtn.classList.toggle("d-none", !authModalClosable());
      setAuthModalOpen(true);
    }
  }
  window.openAuthModal = openAuthModal;
  function setAuthModalOpen(open) {
    window._authModalOpen = !!open;
    if (!document.body) return;
    if (open) {
      document.body.classList.add("auth-modal-open");
      startAuthModalGuard();
    } else {
      document.body.classList.remove("auth-modal-open");
      stopAuthModalGuard();
      if (authModal) {
        ["display", "visibility", "opacity", "pointer-events"].forEach((p) => authModal.style.removeProperty(p));
      }
    }
  }
  function forceAuthModalVisible() {
    if (!authModal || !document.body.contains(authModal)) injectAuthModal();
    if (!authModal) return;
    authModal.classList.add("show");
    authModal.style.setProperty("display", "flex", "important");
    authModal.style.setProperty("visibility", "visible", "important");
    authModal.style.setProperty("opacity", "1", "important");
    authModal.style.setProperty("pointer-events", "auto", "important");
  }
  function authModalTampered() {
    if (!authModal || !document.body.contains(authModal)) return true;
    const cs = window.getComputedStyle(authModal);
    return cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0 || cs.pointerEvents === "none";
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
  function closeAuthModal() {
    if (authModal) authModal.classList.remove("show");
    if (authError) authError.style.display = "none";
    setAuthModalOpen(false);
  }
  function handleAuthAction() {
    const email = authEmail ? authEmail.value.trim() : "";
    const password = authPassword ? authPassword.value : "";
    if (!email || !password) {
      showAuthError("Please enter email and password.");
      return;
    }
    if (authActionBtn) authActionBtn.disabled = true;
    const promise = authMode === "signin" ? signIn(email, password) : signUp(email, password);
    promise.then(() => {
      closeAuthModal();
    }).catch((err) => {
      let msg = err.message || "An error occurred.";
      if (msg.includes("email-already-in-use")) msg = "This email is already registered.";
      else if (msg.includes("wrong-password") || msg.includes("user-not-found")) msg = "Invalid email or password.";
      else if (msg.includes("weak-password")) msg = "Password should be at least 6 characters.";
      else if (msg.includes("invalid-email")) msg = "Please enter a valid email address.";
      showAuthError(msg);
    }).finally(() => {
      if (authActionBtn) authActionBtn.disabled = false;
    });
  }
  function showAuthError(msg) {
    if (authError) {
      authError.textContent = msg;
      authError.style.display = "block";
    }
  }
  function deleteCollection(db, collectionRef, batchSize) {
    batchSize = batchSize || 20;
    return collectionRef.limit(batchSize).get().then(function(snapshot) {
      if (snapshot.size === 0) return Promise.resolve();
      var batch = db.batch();
      snapshot.forEach(function(doc) {
        batch.delete(doc.ref);
      });
      return batch.commit().then(function() {
        return deleteCollection(db, collectionRef, batchSize);
      });
    });
  }
  function deleteUserData(uid) {
    var db = firebase.firestore();
    var promises = [];
    promises.push(deleteCollection(db, db.collection("users").doc(uid).collection("codes")));
    promises.push(deleteCollection(db, db.collection("users").doc(uid).collection("notes")));
    promises.push(deleteCollection(db, db.collection("users").doc(uid).collection("quizzes")));
    promises.push(db.collection("users").doc(uid).collection("sessions").doc("_active").delete());
    promises.push(db.collection("users").doc(uid).collection("meta").doc("profile").delete());
    return Promise.all(promises).then(function() {
    });
  }
  function initSync() {
    if (typeof firebase === "undefined" || !firebase.apps.length) return;
    const db = firebase.firestore();
    let syncUid = null;
    function buildStatusMap() {
      const map = {};
      for (const id of Object.keys(submissions)) {
        const s = submissions[id];
        if (s.status && s.status !== "Unattempted") map[id] = s.status;
      }
      return map;
    }
    function pushChangedItems(ids) {
      if (!syncUid) return Promise.resolve();
      const batch = db.batch();
      const metaRef = db.collection("users").doc(syncUid).collection("meta").doc("profile");
      batch.set(metaRef, {
        tab: new URL(window.location).searchParams.get("tab") || "",
        status: buildStatusMap(),
        tabs: buildTabsMap(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      if (ids) {
        ids.forEach(function(id) {
          const sub = submissions[id];
          if (sub) {
            const codeDoc = {
              code: sub.code || "",
              files: sub.files || null,
              status: sub.status || "Unattempted",
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            batch.set(
              db.collection("users").doc(syncUid).collection("codes").doc(id),
              codeDoc
            );
          }
          if (notes[id] && notes[id].trim()) {
            batch.set(
              db.collection("users").doc(syncUid).collection("notes").doc(id),
              { content: notes[id], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }
            );
          }
        });
      }
      for (var qid in _dirtyQuizzes) {
        if (quizResults[qid]) {
          batch.set(
            db.collection("users").doc(syncUid).collection("quizzes").doc(qid),
            { results: quizResults[qid], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }
          );
        } else {
          batch.delete(
            db.collection("users").doc(syncUid).collection("quizzes").doc(qid)
          );
        }
      }
      return batch.commit();
    }
    function startCloudListener(uid) {
      if (window._cloudUnsub) {
        window._cloudUnsub();
        window._cloudUnsub = null;
      }
      window._cloudUnsub = db.collection("users").doc(uid).collection("meta").doc("profile").onSnapshot(function(snap) {
        if (window._isPushingLocally) return;
        if (!snap.exists) return;
        const data = snap.data();
        if (data._wipedAt && window._wipingUid !== uid) {
          clearLocalProfile();
          window.location.href = "/dashboard/";
          return;
        }
        let changed = false;
        if (data.status) {
          var statusChanged = false;
          for (const id2 of Object.keys(data.status)) {
            if (!submissions[id2]) submissions[id2] = {};
            if (submissions[id2].status !== data.status[id2]) {
              submissions[id2].status = data.status[id2];
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
          try {
            localTabs = JSON.parse(localStorage.getItem("pyjamacode-tabs") || "{}");
          } catch (e) {
            localTabs = {};
          }
          var merged = false;
          for (var id in data.tabs) {
            if (data.tabs[id] && localTabs[id] !== data.tabs[id]) {
              localTabs[id] = data.tabs[id];
              merged = true;
            }
          }
          if (merged) {
            localStorage.setItem("pyjamacode-tabs", JSON.stringify(localTabs));
          }
        }
        if (changed) {
          refreshUI();
          setDirty(false);
        }
      });
    }
    function stopCloudListener() {
      if (window._cloudUnsub) {
        window._cloudUnsub();
        window._cloudUnsub = null;
      }
    }
    function pullFromCloud(uid) {
      if (localStorage.getItem("pyjamacode-cloud-initialized")) return Promise.resolve();
      return db.collection("users").doc(uid).collection("meta").doc("profile").get().then(function(metaSnap) {
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
            try {
              localStorage.setItem("pyjamacode-tabs", JSON.stringify(meta.tabs));
            } catch (e) {
            }
          }
          return db.collection("users").doc(uid).collection("codes").get().then(function(codeSnap) {
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
            return db.collection("users").doc(uid).collection("notes").get().then(function(noteSnap) {
              noteSnap.forEach(function(doc) {
                var data = doc.data();
                if (data.content) notes[doc.id] = data.content;
              });
              persistNotes();
              return db.collection("users").doc(uid).collection("quizzes").get().then(function(quizSnap) {
                quizSnap.forEach(function(doc) {
                  var data = doc.data();
                  quizResults[doc.id] = data.results || {};
                });
                try {
                  localStorage.setItem("pyjamacode-quiz-results", JSON.stringify(quizResults));
                } catch (e) {
                }
                localStorage.setItem("pyjamacode-cloud-initialized", "1");
                setSyncedVersion();
                return Promise.resolve();
              });
            });
          });
        }
        localStorage.setItem("pyjamacode-cloud-initialized", "1");
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
        localStorage.setItem("pyjamacode-cloud-initialized", "1");
        setSyncedVersion();
        window._isPushingLocally = false;
        updateSyncIndicator();
      }).catch(function() {
        window._isPushingLocally = false;
        updateSyncIndicator();
      });
    }
    function refreshUI() {
      loadSubmissions();
      loadNotes();
      const _q = questions.find(function(q) {
        return q.id === activeQuestionId;
      });
      if (activeQuestionId && questionContentEl && (!_q || !_q.isIntro)) selectQuestion(activeQuestionId);
      else renderQuestionList(questionSearchEl ? questionSearchEl.value : "");
    }
    var localSessionId = null;
    var sessionUnsub = null;
    function generateSessionId() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    function registerSession(uid) {
      var maxSessions = window.__APP_CONFIG__ && window.__APP_CONFIG__.maxSessions || 1;
      if (maxSessions <= 0) return;
      localSessionId = localStorage.getItem("pyjamacode-session-id");
      if (!localSessionId) {
        localSessionId = generateSessionId();
        try {
          localStorage.setItem("pyjamacode-session-id", localSessionId);
        } catch (e) {
        }
      }
      var sessCol = db.collection("users").doc(uid).collection("sessions");
      var sessDoc = sessCol.doc("_active");
      sessDoc.get().then(function(docSnap) {
        var needsMigration = true;
        if (docSnap.exists) {
          var d = docSnap.data();
          if (d && d.sessions && typeof d.sessions === "object" && !Array.isArray(d.sessions)) {
            needsMigration = false;
          }
        }
        if (needsMigration) {
          return sessCol.get().then(function(colSnap) {
            var map = {};
            colSnap.forEach(function(doc) {
              if (doc.id === "_active") return;
              var data = doc.data();
              if (data.updatedAt) {
                map[doc.id] = data.updatedAt;
              }
              doc.ref.delete();
            });
            return sessDoc.set({ sessions: map }, { merge: true });
          });
        }
      }).then(function() {
        return sessDoc.set({ sessions: { [localSessionId]: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true });
      }).then(function() {
        if (sessionUnsub) sessionUnsub();
        sessionUnsub = sessDoc.onSnapshot(function(snap) {
          if (!snap.exists || window._isPushingLocally) return;
          var data = snap.data() || {};
          var sessions = data.sessions || {};
          var active = Object.keys(sessions).map(function(id) {
            var ts = sessions[id];
            return { id, ts: ts && ts.toMillis ? ts.toMillis() : ts || 0 };
          });
          active.sort(function(a, b) {
            return a.ts - b.ts;
          });
          if (active.every(function(s) {
            return s.id !== localSessionId;
          })) {
            signOut().then(function() {
              window.location.href = "/?session=expired";
            }).catch(function() {
              window.location.href = "/?session=expired";
            });
            return;
          }
          while (active.length > maxSessions) {
            var oldest = active.shift();
            sessDoc.set({ sessions: { [oldest.id]: firebase.firestore.FieldValue.delete() } }, { merge: true });
          }
        });
      });
    }
    function unregisterSession() {
      if (sessionUnsub) {
        sessionUnsub();
        sessionUnsub = null;
      }
      if (syncUid && localSessionId) {
        db.collection("users").doc(syncUid).collection("sessions").doc("_active").set(
          { sessions: { [localSessionId]: firebase.firestore.FieldValue.delete() } },
          { merge: true }
        );
      }
      try {
        localStorage.removeItem("pyjamacode-session-id");
      } catch (e) {
      }
      localSessionId = null;
    }
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
      var base = document.title.replace(/^\* /, "");
      document.title = v ? "* " + base : base;
    }
    function doSync() {
      if (!syncUid) return Promise.resolve();
      saveCurrentCode();
      saveCurrentNotes();
      var changedIds = Object.keys(_dirtySubmissions);
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
        localStorage.setItem("pyjamacode-cloud-initialized", "1");
        setSyncedVersion();
        window._isPushingLocally = false;
        updateSyncIndicator();
        setDirty(false);
      }).catch(function(err) {
        console.error("Cloud sync failed:", err);
        window._isPushingLocally = false;
        updateSyncIndicator();
      });
    }
    window.__cloudSyncNow = function() {
      return doSync();
    };
    document.addEventListener("keydown", function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        doSync();
      }
    });
    document.addEventListener("cloud-sync-requested", doSync);
    var origPersistSubmissions = persistSubmissions;
    persistSubmissions = function() {
      origPersistSubmissions();
    };
    var origPersistNotes = persistNotes;
    persistNotes = function() {
      origPersistNotes();
    };
  }
  (function() {
    var bp = window.__APP_CONFIG__ && window.__APP_CONFIG__.mobileBreakpoint;
    if (bp && typeof bp === "number") {
      var style = document.createElement("style");
      style.textContent = "@media (max-width:" + bp + "px){.console-resizer{display:none!important}#resizerCasesCase{display:none!important}#questionPane{width:100%!important;flex:1}#sidebarPane{position:fixed;top:56px;left:0;bottom:0;z-index:1040;width:320px!important;max-width:85vw;background:var(--bs-body-bg);border-right:1px solid var(--border-color);transform:translateX(-100%);transition:transform 0.25s ease;overflow-y:auto;box-shadow:4px 0 12px rgba(0,0,0,0.15)}#sidebarPane.sidebar-open{transform:translateX(0)}#sidebarPane .sidebar-close{display:flex!important}.sidebar-backdrop{display:none;position:fixed;inset:0;z-index:1039;background:rgba(0,0,0,0.4)}.sidebar-backdrop.show{display:block}#editorPane{position:static;transform:none;width:100%!important;flex:1;display:flex!important;flex-direction:column}#statusText{text-align:center}.editor-backdrop{display:none;position:fixed;inset:0;z-index:1039;background:rgba(0,0,0,0.4)}.editor-backdrop.show{display:block}.notes-area{z-index:1030!important}.notes-widget{z-index:1032!important}}@media (min-width:768px) and (max-width:" + bp + "px){#readingPane{display:none!important}.center-tab.reading-merged{display:block}.reading-merged{display:block}}@media (max-width:767px){#questionPane{flex:none!important;height:auto!important}.question-pane-body{display:block;overflow:visible}#readingPane{min-width:auto!important;flex:none!important;height:auto!important}#readingPane .pane-body{overflow:visible}}";
      document.head.appendChild(style);
    }
  })();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=main.js.map
