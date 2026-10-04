import "./style.css";
import { APP_NAME } from "./app";
import { STARTER_PUZZLES, type Difficulty, type StarterPuzzle } from "./starter-bank";
import { hasPeerConflict, parsePuzzle, type Digit, type Puzzle } from "./sudoku";

type GameState = {
  puzzle: StarterPuzzle | null;
  entries: Array<Digit | null>;
  notes: Array<Set<Digit>>;
  selectedCell: number | null;
  selectedDigit: Digit | null;
  noteMode: boolean;
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app mount point");
}

const mount = app;

const state: GameState = {
  puzzle: null,
  entries: Array<Digit | null>(81).fill(null),
  notes: Array.from({ length: 81 }, () => new Set<Digit>()),
  selectedCell: null,
  selectedDigit: null,
  noteMode: false,
};

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
        ${difficultyButton("easy", "Easy")}
        ${difficultyButton("medium", "Medium")}
        ${difficultyButton("hard", "Hard")}
      </div>
    </section>
  `;

  mount.querySelectorAll<HTMLButtonElement>("[data-difficulty]").forEach((button) => {
    button.addEventListener("click", () => {
      startPuzzle(button.dataset.difficulty as Difficulty);
    });
  });
}

function renderPuzzle(): void {
  const puzzle = state.puzzle;
  if (!puzzle) {
    return;
  }

  const puzzleNumber =
    STARTER_PUZZLES.filter((starter) => starter.difficulty === puzzle.difficulty).findIndex(
      (starter) => starter.id === puzzle.id,
    ) + 1;

  mount.innerHTML = `
    <section class="game-shell" aria-labelledby="puzzle-title">
      <header class="game-header">
        <div>
          <p class="eyebrow">${APP_NAME}</p>
          <h1 id="puzzle-title">${titleCase(puzzle.difficulty)} puzzle ${puzzleNumber}</h1>
        </div>
        <button class="secondary-button" type="button" data-action="change-puzzle">Change puzzle</button>
      </header>
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
        </aside>
      </div>
    </section>
  `;

  mount.querySelectorAll<HTMLButtonElement>("[data-cell]").forEach((button) => {
    button.addEventListener("click", () => selectCell(Number(button.dataset.cell)));
  });

  mount.querySelectorAll<HTMLButtonElement>("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => enterDigit(Number(button.dataset.digit) as Digit));
  });

  mount.querySelector<HTMLButtonElement>("[data-action='note-mode']")?.addEventListener("click", () => {
    state.noteMode = !state.noteMode;
    render();
  });

  mount.querySelector<HTMLButtonElement>("[data-action='erase']")?.addEventListener("click", eraseSelected);
  mount
    .querySelector<HTMLButtonElement>("[data-action='change-puzzle']")
    ?.addEventListener("click", () => {
      state.puzzle = null;
      render();
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
  const invalid = entry !== null && hasPeerConflict(currentPuzzle(), index, entry);
  const label = `Row ${row} column ${column} ${value ?? "empty"}`;
  const classes = ["cell", given ? "is-given" : "", selected, invalid ? "has-conflict" : ""]
    .filter(Boolean)
    .join(" ");

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
  state.entries = Array<Digit | null>(81).fill(null);
  state.notes = Array.from({ length: 81 }, () => new Set<Digit>());
  state.selectedCell = null;
  state.selectedDigit = null;
  state.noteMode = false;
  render();
}

function selectCell(index: number): void {
  state.selectedCell = index;

  if (state.selectedDigit) {
    applyDigit(index, state.selectedDigit);
    return;
  }

  render();
}

function enterDigit(digit: Digit): void {
  state.selectedDigit = digit;

  if (state.selectedCell !== null) {
    applyDigit(state.selectedCell, digit);
    return;
  }

  render();
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
  }

  render();
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

  render();
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

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
