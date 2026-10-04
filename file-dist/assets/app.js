"use strict";
(() => {
  // src/app.ts
  var APP_NAME = "Ninefold Daily";

  // src/starter-bank.ts
  var BASE_SOLUTION = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
  var STARTER_PUZZLES = [
    {
      id: "easy-01",
      difficulty: "easy",
      givens: "534078002000100308108042567859000420006000701000924006001030000200009605000000079",
      solution: BASE_SOLUTION
    },
    {
      id: "easy-02",
      difficulty: "easy",
      givens: "030078002002195040190302560009701000426000091000024006001530000080010630000200079",
      solution: BASE_SOLUTION
    },
    {
      id: "easy-03",
      difficulty: "easy",
      givens: "530670012000005000090302567059000020020053700003024050901037084000009000305206070",
      solution: BASE_SOLUTION
    },
    {
      id: "easy-04",
      difficulty: "easy",
      givens: "530000000000105348008302560809700400020800001010904000001007284000010635045006079",
      solution: BASE_SOLUTION
    },
    {
      id: "medium-01",
      difficulty: "medium",
      givens: "030678010000090000100040507800001023400800701010920800060007284207400005000000000",
      solution: BASE_SOLUTION
    },
    {
      id: "medium-02",
      difficulty: "medium",
      givens: "030008010070195040000002567059700003000803090000000800961000000287019005000200070",
      solution: BASE_SOLUTION
    },
    {
      id: "medium-03",
      difficulty: "medium",
      givens: "030608000072190008090042060059001403006800700713000006000507000200009000000280009",
      solution: BASE_SOLUTION
    },
    {
      id: "medium-04",
      difficulty: "medium",
      givens: "500608900602005000000300000000700403406850001000920006061500080207010005045080100",
      solution: BASE_SOLUTION
    },
    {
      id: "hard-01",
      difficulty: "hard",
      givens: "004000000002100308008302560050061400000803000003004000960000000080000035000280109",
      solution: BASE_SOLUTION
    },
    {
      id: "hard-02",
      difficulty: "hard",
      givens: "034070000000000008100042500850001000006003701010900000900530000007010030345000009",
      solution: BASE_SOLUTION
    },
    {
      id: "hard-03",
      difficulty: "hard",
      givens: "000608900070005040008300507009000400406003001703024000060007000000000605300200070",
      solution: BASE_SOLUTION
    },
    {
      id: "hard-04",
      difficulty: "hard",
      givens: "034000000600005000000302000000060403020000001010904806960007204007000000305280070",
      solution: BASE_SOLUTION
    }
  ];

  // src/sudoku.ts
  var ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var PUZZLE_LENGTH = 81;
  var BASE_SOLUTION2 = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
  var TARGET_CLUES = {
    easy: 36,
    medium: 31,
    hard: 27
  };
  function parsePuzzle(givens) {
    if (givens.length !== PUZZLE_LENGTH) {
      throw new Error("A Sudoku puzzle must contain exactly 81 cells.");
    }
    if (!/^[0-9.]+$/.test(givens)) {
      throw new Error("A Sudoku puzzle may only contain digits, zero, or dots.");
    }
    return {
      cells: Array.from(givens, (char) => {
        const value = char === "." || char === "0" ? null : Number(char);
        return {
          value,
          given: value !== null
        };
      })
    };
  }
  function hasPeerConflict(puzzle, index, digit) {
    assertIndex(index);
    return peerIndexes(index).some((peerIndex) => puzzle.cells[peerIndex]?.value === digit);
  }
  function solvePuzzle(puzzle, maxSolutions = 2) {
    const board = puzzle.cells.map((cell) => cell.value);
    const solutions = [];
    search(board, solutions, maxSolutions);
    return {
      solution: solutions[0] ? solutions[0].join("") : null,
      solutionCount: solutions.length
    };
  }
  function isSolved(puzzle, solution) {
    return puzzle.cells.map((cell) => cell.value ?? "0").join("") === solution;
  }
  function generatePuzzle(difficulty, seed) {
    const targetClues = TARGET_CLUES[difficulty];
    const cells = BASE_SOLUTION2.split("");
    for (const index of shuffledIndexes(seed)) {
      const previous = cells[index];
      cells[index] = "0";
      const givens = cells.join("");
      const solved = solvePuzzle(parsePuzzle(givens));
      const clueCount = cells.filter((cell) => cell !== "0").length;
      if (solved.solutionCount !== 1 || solved.solution !== BASE_SOLUTION2 || clueCount < targetClues) {
        cells[index] = previous;
      }
      if (cells.filter((cell) => cell !== "0").length === targetClues) {
        break;
      }
    }
    return {
      difficulty,
      givens: cells.join(""),
      solution: BASE_SOLUTION2,
      ratingEvidence: solverRatingEvidence(cells.join(""))
    };
  }
  function solverRatingEvidence(givens) {
    const emptyCells = Array.from(givens).filter((cell) => cell === "0" || cell === ".").length;
    if (emptyCells >= 54) {
      return "Solver-rated hard: at least 54 empty cells with a unique solution.";
    }
    if (emptyCells >= 49) {
      return "Solver-rated medium: at least 49 empty cells with a unique solution.";
    }
    return "Solver-rated easy: fewer than 49 empty cells with a unique solution.";
  }
  function search(board, solutions, maxSolutions) {
    if (solutions.length >= maxSolutions) {
      return;
    }
    const next = findMostConstrainedCell(board);
    if (!next) {
      solutions.push(board.slice());
      return;
    }
    for (const digit of next.candidates) {
      board[next.index] = digit;
      search(board, solutions, maxSolutions);
      board[next.index] = null;
    }
  }
  function findMostConstrainedCell(board) {
    let best = null;
    for (let index = 0; index < board.length; index += 1) {
      if (board[index] !== null) {
        continue;
      }
      const candidates = ALL_DIGITS.filter(
        (digit) => !boardHasPeerConflict(board, index, digit)
      );
      if (candidates.length === 0) {
        return { index, candidates };
      }
      if (!best || candidates.length < best.candidates.length) {
        best = { index, candidates };
      }
    }
    return best;
  }
  function boardHasPeerConflict(board, index, digit) {
    return peerIndexes(index).some((peerIndex) => board[peerIndex] === digit);
  }
  function peerIndexes(index) {
    const row = Math.floor(index / 9);
    const column = index % 9;
    const boxRow = Math.floor(row / 3) * 3;
    const boxColumn = Math.floor(column / 3) * 3;
    const peers = /* @__PURE__ */ new Set();
    for (let offset = 0; offset < 9; offset += 1) {
      peers.add(row * 9 + offset);
      peers.add(offset * 9 + column);
    }
    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
      for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
        peers.add((boxRow + rowOffset) * 9 + boxColumn + columnOffset);
      }
    }
    peers.delete(index);
    return Array.from(peers);
  }
  function assertIndex(index) {
    if (!Number.isInteger(index) || index < 0 || index >= PUZZLE_LENGTH) {
      throw new Error("Cell index must be between 0 and 80.");
    }
  }
  function shuffledIndexes(seed) {
    const indexes = Array.from({ length: PUZZLE_LENGTH }, (_, index) => index);
    const next = seededRandom(seed);
    for (let index = indexes.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(next() * (index + 1));
      [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
    }
    return indexes;
  }
  function seededRandom(seed) {
    let state2 = seed >>> 0;
    return () => {
      state2 = state2 * 1664525 + 1013904223 >>> 0;
      return state2 / 2 ** 32;
    };
  }

  // src/main.ts
  var STORAGE_KEY = "ninefold-daily-state-v1";
  var DEFAULT_SETTINGS = {
    mistakeChecking: true,
    conflictHighlighting: true,
    sound: true,
    reducedMotion: false,
    autoNoteCleanup: true
  };
  var app = document.querySelector("#app");
  if (!app) {
    throw new Error("Missing #app mount point");
  }
  var mount = app;
  var state = loadState();
  document.addEventListener("keydown", (event) => {
    if (!state.puzzle) {
      return;
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      enterDigit(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      eraseSelected();
    } else if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      state.noteMode = !state.noteMode;
      saveAndRender();
    } else if (event.key === "Escape") {
      event.preventDefault();
      state.paused = !state.paused;
      saveAndRender();
    }
  });
  window.setInterval(() => {
    if (state.puzzle && !state.paused && !state.completed) {
      state.elapsedSeconds += 1;
      saveState();
      updateTimerText();
    }
  }, 1e3);
  render();
  function render() {
    if (!state.puzzle) {
      renderStart();
      return;
    }
    renderPuzzle();
  }
  function renderStart() {
    mount.innerHTML = `
    <section class="app-shell" aria-labelledby="app-title">
      <header class="masthead">
        <p class="eyebrow">${APP_NAME}</p>
        <h1 id="app-title">Choose a starter puzzle.</h1>
        <p class="intro">Pick a difficulty and Ninefold Daily opens the next unfinished puzzle.</p>
      </header>
      <div class="difficulty-row" aria-label="Choose difficulty">
        <button class="primary-button" type="button" data-special="daily">Daily puzzle</button>
        <button class="primary-button" type="button" data-special="archive">Archive puzzle</button>
        ${difficultyButton("easy", "Easy")}
        ${difficultyButton("medium", "Medium")}
        ${difficultyButton("hard", "Hard")}
        <button class="primary-button" type="button" data-generated="medium">Generated medium</button>
      </div>
      <dl class="stats-strip" aria-label="Stats">
        <div><dt>Completion count</dt><dd>${state.stats.completionCount}</dd></div>
        <div><dt>Current streak</dt><dd>${state.stats.currentStreak}</dd></div>
        <div><dt>Longest streak</dt><dd>${state.stats.longestStreak}</dd></div>
      </dl>
    </section>
  `;
    mount.querySelectorAll("[data-difficulty]").forEach((button) => {
      button.addEventListener("click", () => {
        startPuzzle(button.dataset.difficulty);
      });
    });
    mount.querySelector("[data-generated]")?.addEventListener("click", () => {
      const generated = generatePuzzle("medium", Date.now() % 1e5);
      state.puzzle = {
        id: "generated-medium",
        difficulty: generated.difficulty,
        givens: generated.givens,
        solution: generated.solution
      };
      state.hintMessage = generated.ratingEvidence;
      state.puzzleKind = "generated";
      resetPuzzleProgress();
      state.hintMessage = generated.ratingEvidence;
      saveAndRender();
    });
    mount.querySelectorAll("[data-special]").forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.dataset.special === "archive" ? "archive" : "daily";
        state.puzzle = puzzleForDate(kind === "daily" ? 0 : -1);
        state.puzzleKind = kind;
        resetPuzzleProgress();
        saveAndRender();
      });
    });
  }
  function renderPuzzle() {
    const puzzle = state.puzzle;
    if (!puzzle) {
      return;
    }
    const starterIndex = STARTER_PUZZLES.filter(
      (starter) => starter.difficulty === puzzle.difficulty
    ).findIndex((starter) => starter.id === puzzle.id);
    const title = state.puzzleKind === "daily" ? "Daily puzzle" : state.puzzleKind === "archive" ? "Archive puzzle" : starterIndex >= 0 ? `${titleCase(puzzle.difficulty)} puzzle ${starterIndex + 1}` : `Generated ${puzzle.difficulty}`;
    mount.innerHTML = `
    <section class="game-shell" aria-labelledby="puzzle-title">
      <header class="game-header">
        <div>
          <p class="eyebrow">${APP_NAME}</p>
          <h1 id="puzzle-title">${title}</h1>
          <p class="status-line">
            <span data-timer>${formatTime(state.elapsedSeconds)}</span>
            <span>${state.hintsUsed} hints</span>
            <span>${state.completed ? "Complete" : "In progress"}</span>
          </p>
        </div>
        <div class="header-actions">
          <button class="secondary-button" type="button" data-action="pause">${state.paused ? "Resume" : "Pause"}</button>
          <button class="secondary-button" type="button" data-action="settings">Settings</button>
          <button class="secondary-button" type="button" data-action="change-puzzle">Change puzzle</button>
        </div>
      </header>
      ${state.paused ? `<div class="pause-panel"><p>Paused</p></div>` : ""}
      <div class="play-area">
        <div class="grid" role="grid" aria-label="Sudoku grid">
          ${Array.from({ length: 81 }, (_, index) => renderCell(index)).join("")}
        </div>
        <aside class="controls" aria-label="Puzzle controls">
          <div class="number-pad" aria-label="Number pad">
            ${Array.from({ length: 9 }, (_, index) => numberButton(index + 1)).join("")}
          </div>
          <button class="mode-button ${state.noteMode ? "is-active" : ""}" type="button" data-action="note-mode" aria-pressed="${state.noteMode}">
            Note mode
          </button>
          <button class="secondary-button" type="button" data-action="erase">Erase</button>
          <button class="secondary-button" type="button" data-action="clear-all">Clear all</button>
          <button class="secondary-button" type="button" data-action="hint">Hint</button>
          <button class="secondary-button" type="button" data-action="check">Check puzzle</button>
        </aside>
      </div>
      ${state.hintMessage ? `<p class="hint-message" role="status">${state.hintMessage}</p>` : ""}
      ${state.settingsOpen ? renderSettings() : ""}
    </section>
  `;
    bindPuzzleEvents();
  }
  function renderSettings() {
    return `
    <section class="settings-panel" aria-label="Settings">
      ${settingCheckbox("mistakeChecking", "Mistake checking")}
      ${settingCheckbox("conflictHighlighting", "Conflict highlighting")}
      ${settingCheckbox("sound", "Sound")}
      ${settingCheckbox("reducedMotion", "Reduced motion")}
      ${settingCheckbox("autoNoteCleanup", "Auto note cleanup")}
    </section>
  `;
  }
  function settingCheckbox(key, label) {
    return `
    <label>
      <input type="checkbox" data-setting="${key}" ${state.settings[key] ? "checked" : ""} />
      ${label}
    </label>
  `;
  }
  function bindPuzzleEvents() {
    mount.querySelectorAll("[data-cell]").forEach((button) => {
      button.addEventListener("click", () => selectCell(Number(button.dataset.cell)));
      button.addEventListener("focus", () => {
        state.selectedCell = Number(button.dataset.cell);
        saveState();
      });
    });
    mount.querySelectorAll("[data-digit]").forEach((button) => {
      button.addEventListener("click", () => enterDigit(Number(button.dataset.digit)));
    });
    mount.querySelector("[data-action='note-mode']")?.addEventListener("click", () => {
      state.noteMode = !state.noteMode;
      saveAndRender();
    });
    mount.querySelector("[data-action='erase']")?.addEventListener("click", eraseSelected);
    mount.querySelector("[data-action='clear-all']")?.addEventListener("click", clearAllSelected);
    mount.querySelector("[data-action='hint']")?.addEventListener("click", giveHint);
    mount.querySelector("[data-action='check']")?.addEventListener("click", checkPuzzle);
    mount.querySelector("[data-action='pause']")?.addEventListener("click", () => {
      state.paused = !state.paused;
      saveAndRender();
    });
    mount.querySelector("[data-action='settings']")?.addEventListener("click", () => {
      state.settingsOpen = !state.settingsOpen;
      saveAndRender();
    });
    mount.querySelector("[data-action='change-puzzle']")?.addEventListener("click", () => {
      state.puzzle = null;
      saveAndRender();
    });
    mount.querySelectorAll("[data-setting]").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.setting;
        state.settings[key] = input.checked;
        saveAndRender();
      });
    });
  }
  function difficultyButton(difficulty, label) {
    return `<button class="primary-button" type="button" data-difficulty="${difficulty}">${label}</button>`;
  }
  function numberButton(digit) {
    const active = state.selectedDigit === digit ? " is-active" : "";
    return `<button class="number-button${active}" type="button" data-digit="${digit}">${digit}</button>`;
  }
  function renderCell(index) {
    const puzzle = state.puzzle;
    if (!puzzle) {
      return "";
    }
    const parsed = parsePuzzle(puzzle.givens);
    const given = parsed.cells[index].value;
    const entry = state.entries[index];
    const value = given ?? entry;
    const notes = Array.from(state.notes[index]).sort().join("");
    const row = Math.floor(index / 9) + 1;
    const column = index % 9 + 1;
    const selected = state.selectedCell === index ? " is-selected" : "";
    const invalid = state.settings.mistakeChecking && entry !== null && hasPeerConflict(currentPuzzle(), index, entry);
    const conflictClass = state.settings.conflictHighlighting && invalid ? "has-conflict" : "";
    const label = `Row ${row} column ${column} ${value ?? "empty"}`;
    const classes = ["cell", given ? "is-given" : "", selected, conflictClass].filter(Boolean).join(" ");
    return `
    <button
      class="${classes}"
      type="button"
      role="gridcell"
      data-cell="${index}"
      aria-label="${label}"
      aria-invalid="${invalid}"
      ${given ? "disabled" : ""}
    >
      ${value ? `<span class="entry">${value}</span>` : `<span class="notes">${notes.split("").map((note) => `<span>${note}</span>`).join("")}</span>`}
    </button>
  `;
  }
  function startPuzzle(difficulty) {
    const puzzle = STARTER_PUZZLES.find((starter) => starter.difficulty === difficulty);
    if (!puzzle) {
      throw new Error(`Missing starter puzzle for ${difficulty}.`);
    }
    state.puzzle = puzzle;
    state.puzzleKind = "starter";
    resetPuzzleProgress();
    saveAndRender();
  }
  function resetPuzzleProgress() {
    state.entries = Array(81).fill(null);
    state.notes = Array.from({ length: 81 }, () => /* @__PURE__ */ new Set());
    state.selectedCell = null;
    state.selectedDigit = null;
    state.noteMode = false;
    state.elapsedSeconds = 0;
    state.paused = false;
    state.completed = false;
    state.hintsUsed = 0;
    state.hintMessage = null;
  }
  function selectCell(index) {
    state.selectedCell = index;
    if (state.selectedDigit) {
      applyDigit(index, state.selectedDigit);
      return;
    }
    saveAndRender();
  }
  function enterDigit(digit) {
    state.selectedDigit = digit;
    if (state.selectedCell !== null) {
      applyDigit(state.selectedCell, digit);
      return;
    }
    saveAndRender();
  }
  function applyDigit(index, digit) {
    if (state.noteMode) {
      const notes = state.notes[index];
      if (notes.has(digit)) {
        notes.delete(digit);
      } else {
        notes.add(digit);
      }
    } else {
      state.entries[index] = digit;
      state.notes[index].clear();
      cleanupPeerNotes(index, digit);
    }
    if (state.puzzle && isSolved(currentPuzzle(), state.puzzle.solution)) {
      completePuzzle();
    }
    saveAndRender();
  }
  function cleanupPeerNotes(index, digit) {
    if (!state.settings.autoNoteCleanup) {
      return;
    }
    for (let peerIndex = 0; peerIndex < 81; peerIndex += 1) {
      if (peerIndex !== index && hasPeerConflict(currentPuzzle(), peerIndex, digit)) {
        state.notes[peerIndex].delete(digit);
      }
    }
  }
  function eraseSelected() {
    if (state.selectedCell === null) {
      return;
    }
    if (state.noteMode) {
      state.notes[state.selectedCell].clear();
    } else {
      state.entries[state.selectedCell] = null;
    }
    saveAndRender();
  }
  function clearAllSelected() {
    if (state.selectedCell === null) {
      return;
    }
    state.entries[state.selectedCell] = null;
    state.notes[state.selectedCell].clear();
    saveAndRender();
  }
  function giveHint() {
    const puzzle = state.puzzle;
    if (!puzzle) {
      return;
    }
    const parsed = parsePuzzle(puzzle.givens);
    const target = state.selectedCell !== null && parsed.cells[state.selectedCell].value === null ? state.selectedCell : parsed.cells.findIndex((cell, index) => cell.value === null && state.entries[index] === null);
    if (target < 0) {
      return;
    }
    const row = Math.floor(target / 9) + 1;
    const column = target % 9 + 1;
    const digit = puzzle.solution[target];
    state.selectedCell = target;
    state.hintsUsed += 1;
    state.hintMessage = `Hint step: row ${row}, column ${column} can be ${digit}. Check its row, column, and box before revealing.`;
    saveAndRender();
  }
  function checkPuzzle() {
    if (!state.puzzle) {
      return;
    }
    if (isSolved(currentPuzzle(), state.puzzle.solution)) {
      completePuzzle();
    }
    saveAndRender();
  }
  function completePuzzle() {
    if (state.completed) {
      return;
    }
    state.completed = true;
    state.stats.completionCount += 1;
    if (state.puzzleKind === "daily") {
      state.stats.currentStreak += 1;
      state.stats.longestStreak = Math.max(state.stats.longestStreak, state.stats.currentStreak);
    }
  }
  function currentPuzzle() {
    if (!state.puzzle) {
      throw new Error("No puzzle is active.");
    }
    const parsed = parsePuzzle(state.puzzle.givens);
    return {
      cells: parsed.cells.map((cell, index) => ({
        value: cell.value ?? state.entries[index],
        given: cell.given
      }))
    };
  }
  function saveAndRender() {
    saveState();
    render();
  }
  function saveState() {
    const saved = {
      ...state,
      puzzleId: state.puzzle?.id ?? null,
      notes: state.notes.map((notes) => Array.from(notes))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  function loadState() {
    const emptyState = {
      puzzle: null,
      entries: Array(81).fill(null),
      notes: Array.from({ length: 81 }, () => /* @__PURE__ */ new Set()),
      selectedCell: null,
      selectedDigit: null,
      noteMode: false,
      elapsedSeconds: 0,
      paused: false,
      completed: false,
      hintsUsed: 0,
      hintMessage: null,
      settingsOpen: false,
      settings: { ...DEFAULT_SETTINGS },
      puzzleKind: "starter",
      stats: {
        completionCount: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState;
    }
    try {
      const saved = JSON.parse(raw);
      return {
        ...emptyState,
        ...saved,
        puzzle: STARTER_PUZZLES.find((puzzle) => puzzle.id === saved.puzzleId) ?? saved.puzzle,
        notes: saved.notes.map((notes) => new Set(notes)),
        settings: { ...DEFAULT_SETTINGS, ...saved.settings }
      };
    } catch {
      return emptyState;
    }
  }
  function puzzleForDate(dayOffset) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() + dayOffset);
    const dayNumber = Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5
    );
    return STARTER_PUZZLES[dayNumber % STARTER_PUZZLES.length];
  }
  function updateTimerText() {
    const timer = mount.querySelector("[data-timer]");
    if (timer) {
      timer.textContent = formatTime(state.elapsedSeconds);
    }
  }
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  function titleCase(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
})();
