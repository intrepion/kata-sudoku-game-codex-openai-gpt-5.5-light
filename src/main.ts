import "./style.css";
import { APP_NAME } from "./app";
import { STARTER_PUZZLES, type Difficulty, type StarterPuzzle } from "./starter-bank";
import {
  generatePuzzle,
  hasPeerConflict,
  isSolved,
  parsePuzzle,
  type Digit,
  type Puzzle,
} from "./sudoku";

type Settings = {
  mistakeChecking: boolean;
  conflictHighlighting: boolean;
  sound: boolean;
  reducedMotion: boolean;
  autoNoteCleanup: boolean;
};

type GameState = {
  puzzle: StarterPuzzle | null;
  entries: Array<Digit | null>;
  notes: Array<Set<Digit>>;
  selectedCell: number | null;
  selectedDigit: Digit | null;
  noteMode: boolean;
  elapsedSeconds: number;
  paused: boolean;
  completed: boolean;
  hintsUsed: number;
  settingsOpen: boolean;
  settings: Settings;
  puzzleKind: "starter" | "generated" | "daily" | "archive";
  stats: {
    completionCount: number;
    currentStreak: number;
    longestStreak: number;
  };
};

type SavedState = Omit<GameState, "puzzle" | "notes"> & {
  puzzleId: string | null;
  notes: Digit[][];
};

const STORAGE_KEY = "ninefold-daily-state-v1";
const DEFAULT_SETTINGS: Settings = {
  mistakeChecking: true,
  conflictHighlighting: true,
  sound: true,
  reducedMotion: false,
  autoNoteCleanup: true,
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app mount point");
}

const mount = app;
const state: GameState = loadState();

document.addEventListener("keydown", (event) => {
  if (!state.puzzle) {
    return;
  }

  if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    enterDigit(Number(event.key) as Digit);
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
}, 1000);

render();

function render(): void {
  if (!state.puzzle) {
    renderStart();
    return;
  }

  renderPuzzle();
}

function renderStart(): void {
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

  mount.querySelectorAll<HTMLButtonElement>("[data-difficulty]").forEach((button) => {
    button.addEventListener("click", () => {
      startPuzzle(button.dataset.difficulty as Difficulty);
    });
  });

  mount.querySelector<HTMLButtonElement>("[data-generated]")?.addEventListener("click", () => {
    const generated = generatePuzzle("medium", Date.now() % 100_000);
    state.puzzle = {
      id: "generated-medium",
      difficulty: generated.difficulty,
      givens: generated.givens,
      solution: generated.solution,
    };
    state.puzzleKind = "generated";
    resetPuzzleProgress();
    saveAndRender();
  });

  mount.querySelectorAll<HTMLButtonElement>("[data-special]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.special === "archive" ? "archive" : "daily";
      state.puzzle = kind === "daily" ? STARTER_PUZZLES[0] : STARTER_PUZZLES[1];
      state.puzzleKind = kind;
      resetPuzzleProgress();
      saveAndRender();
    });
  });
}

function renderPuzzle(): void {
  const puzzle = state.puzzle;
  if (!puzzle) {
    return;
  }

  const starterIndex = STARTER_PUZZLES.filter(
    (starter) => starter.difficulty === puzzle.difficulty,
  ).findIndex((starter) => starter.id === puzzle.id);
  const title =
    state.puzzleKind === "daily"
      ? "Daily puzzle"
      : state.puzzleKind === "archive"
        ? "Archive puzzle"
        : starterIndex >= 0
      ? `${titleCase(puzzle.difficulty)} puzzle ${starterIndex + 1}`
      : `Generated ${puzzle.difficulty}`;

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
            ${Array.from({ length: 9 }, (_, index) => numberButton((index + 1) as Digit)).join("")}
          </div>
          <button class="mode-button ${state.noteMode ? "is-active" : ""}" type="button" data-action="note-mode" aria-pressed="${state.noteMode}">
            Note mode
          </button>
          <button class="secondary-button" type="button" data-action="erase">Erase</button>
          <button class="secondary-button" type="button" data-action="hint">Hint</button>
          <button class="secondary-button" type="button" data-action="check">Check puzzle</button>
        </aside>
      </div>
      ${state.settingsOpen ? renderSettings() : ""}
    </section>
  `;

  bindPuzzleEvents();
}

function renderSettings(): string {
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

function settingCheckbox(key: keyof Settings, label: string): string {
  return `
    <label>
      <input type="checkbox" data-setting="${key}" ${state.settings[key] ? "checked" : ""} />
      ${label}
    </label>
  `;
}

function bindPuzzleEvents(): void {
  mount.querySelectorAll<HTMLButtonElement>("[data-cell]").forEach((button) => {
    button.addEventListener("click", () => selectCell(Number(button.dataset.cell)));
    button.addEventListener("focus", () => {
      state.selectedCell = Number(button.dataset.cell);
      saveState();
    });
  });

  mount.querySelectorAll<HTMLButtonElement>("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => enterDigit(Number(button.dataset.digit) as Digit));
  });

  mount.querySelector<HTMLButtonElement>("[data-action='note-mode']")?.addEventListener("click", () => {
    state.noteMode = !state.noteMode;
    saveAndRender();
  });

  mount.querySelector<HTMLButtonElement>("[data-action='erase']")?.addEventListener("click", eraseSelected);
  mount.querySelector<HTMLButtonElement>("[data-action='hint']")?.addEventListener("click", giveHint);
  mount.querySelector<HTMLButtonElement>("[data-action='check']")?.addEventListener("click", checkPuzzle);
  mount.querySelector<HTMLButtonElement>("[data-action='pause']")?.addEventListener("click", () => {
    state.paused = !state.paused;
    saveAndRender();
  });
  mount.querySelector<HTMLButtonElement>("[data-action='settings']")?.addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    saveAndRender();
  });
  mount
    .querySelector<HTMLButtonElement>("[data-action='change-puzzle']")
    ?.addEventListener("click", () => {
      state.puzzle = null;
      saveAndRender();
    });

  mount.querySelectorAll<HTMLInputElement>("[data-setting]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.setting as keyof Settings;
      state.settings[key] = input.checked;
      saveAndRender();
    });
  });
}

function difficultyButton(difficulty: Difficulty, label: string): string {
  return `<button class="primary-button" type="button" data-difficulty="${difficulty}">${label}</button>`;
}

function numberButton(digit: Digit): string {
  const active = state.selectedDigit === digit ? " is-active" : "";
  return `<button class="number-button${active}" type="button" data-digit="${digit}">${digit}</button>`;
}

function renderCell(index: number): string {
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
  const column = (index % 9) + 1;
  const selected = state.selectedCell === index ? " is-selected" : "";
  const invalid =
    state.settings.mistakeChecking && entry !== null && hasPeerConflict(currentPuzzle(), index, entry);
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
      ${
        value
          ? `<span class="entry">${value}</span>`
          : `<span class="notes">${notes
              .split("")
              .map((note) => `<span>${note}</span>`)
              .join("")}</span>`
      }
    </button>
  `;
}

function startPuzzle(difficulty: Difficulty): void {
  const puzzle = STARTER_PUZZLES.find((starter) => starter.difficulty === difficulty);
  if (!puzzle) {
    throw new Error(`Missing starter puzzle for ${difficulty}.`);
  }

  state.puzzle = puzzle;
  state.puzzleKind = "starter";
  resetPuzzleProgress();
  saveAndRender();
}

function resetPuzzleProgress(): void {
  state.entries = Array<Digit | null>(81).fill(null);
  state.notes = Array.from({ length: 81 }, () => new Set<Digit>());
  state.selectedCell = null;
  state.selectedDigit = null;
  state.noteMode = false;
  state.elapsedSeconds = 0;
  state.paused = false;
  state.completed = false;
  state.hintsUsed = 0;
}

function selectCell(index: number): void {
  state.selectedCell = index;

  if (state.selectedDigit) {
    applyDigit(index, state.selectedDigit);
    return;
  }

  saveAndRender();
}

function enterDigit(digit: Digit): void {
  state.selectedDigit = digit;

  if (state.selectedCell !== null) {
    applyDigit(state.selectedCell, digit);
    return;
  }

  saveAndRender();
}

function applyDigit(index: number, digit: Digit): void {
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

function cleanupPeerNotes(index: number, digit: Digit): void {
  if (!state.settings.autoNoteCleanup) {
    return;
  }

  for (let peerIndex = 0; peerIndex < 81; peerIndex += 1) {
    if (peerIndex !== index && hasPeerConflict(currentPuzzle(), peerIndex, digit)) {
      state.notes[peerIndex].delete(digit);
    }
  }
}

function eraseSelected(): void {
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

function giveHint(): void {
  const puzzle = state.puzzle;
  if (!puzzle) {
    return;
  }

  const parsed = parsePuzzle(puzzle.givens);
  const target =
    state.selectedCell !== null && parsed.cells[state.selectedCell].value === null
      ? state.selectedCell
      : parsed.cells.findIndex((cell, index) => cell.value === null && state.entries[index] === null);

  if (target < 0) {
    return;
  }

  state.entries[target] = Number(puzzle.solution[target]) as Digit;
  state.notes[target].clear();
  state.selectedCell = target;
  state.hintsUsed += 1;
  saveAndRender();
}

function checkPuzzle(): void {
  if (!state.puzzle) {
    return;
  }

  state.completed = isSolved(currentPuzzle(), state.puzzle.solution);
  if (state.completed) {
    completePuzzle();
  }
  saveAndRender();
}

function completePuzzle(): void {
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

function currentPuzzle(): Puzzle {
  if (!state.puzzle) {
    throw new Error("No puzzle is active.");
  }

  const parsed = parsePuzzle(state.puzzle.givens);
  return {
    cells: parsed.cells.map((cell, index) => ({
      value: cell.value ?? state.entries[index],
      given: cell.given,
    })),
  };
}

function saveAndRender(): void {
  saveState();
  render();
}

function saveState(): void {
  const saved: SavedState = {
    ...state,
    puzzleId: state.puzzle?.id ?? null,
    notes: state.notes.map((notes) => Array.from(notes)),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function loadState(): GameState {
  const emptyState: GameState = {
    puzzle: null,
    entries: Array<Digit | null>(81).fill(null),
    notes: Array.from({ length: 81 }, () => new Set<Digit>()),
    selectedCell: null,
    selectedDigit: null,
    noteMode: false,
    elapsedSeconds: 0,
    paused: false,
    completed: false,
    hintsUsed: 0,
    settingsOpen: false,
    settings: { ...DEFAULT_SETTINGS },
    puzzleKind: "starter",
    stats: {
      completionCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyState;
  }

  try {
    const saved = JSON.parse(raw) as SavedState;
    return {
      ...emptyState,
      ...saved,
      puzzle: STARTER_PUZZLES.find((puzzle) => puzzle.id === saved.puzzleId) ?? null,
      notes: saved.notes.map((notes) => new Set(notes)),
      settings: { ...DEFAULT_SETTINGS, ...saved.settings },
    };
  } catch {
    return emptyState;
  }
}

function updateTimerText(): void {
  const timer = mount.querySelector<HTMLElement>("[data-timer]");
  if (timer) {
    timer.textContent = formatTime(state.elapsedSeconds);
  }
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
