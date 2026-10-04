export const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type Digit = (typeof ALL_DIGITS)[number];
export type Cell = {
  value: Digit | null;
  given: boolean;
};
export type Puzzle = {
  cells: Cell[];
};
export type SolveResult = {
  solution: string | null;
  solutionCount: number;
};

const PUZZLE_LENGTH = 81;

export function parsePuzzle(givens: string): Puzzle {
  if (givens.length !== PUZZLE_LENGTH) {
    throw new Error("A Sudoku puzzle must contain exactly 81 cells.");
  }

  if (!/^[0-9.]+$/.test(givens)) {
    throw new Error("A Sudoku puzzle may only contain digits, zero, or dots.");
  }

  return {
    cells: Array.from(givens, (char) => {
      const value = char === "." || char === "0" ? null : (Number(char) as Digit);
      return {
        value,
        given: value !== null,
      };
    }),
  };
}

export function candidatesFor(puzzle: Puzzle, index: number): Digit[] {
  assertIndex(index);

  if (puzzle.cells[index]?.value !== null) {
    return [];
  }

  return ALL_DIGITS.filter((digit) => !hasPeerConflict(puzzle, index, digit));
}

export function hasPeerConflict(puzzle: Puzzle, index: number, digit: Digit): boolean {
  assertIndex(index);

  return peerIndexes(index).some((peerIndex) => puzzle.cells[peerIndex]?.value === digit);
}

export function solvePuzzle(puzzle: Puzzle, maxSolutions = 2): SolveResult {
  const board = puzzle.cells.map((cell) => cell.value);
  const solutions: Digit[][] = [];

  search(board, solutions, maxSolutions);

  return {
    solution: solutions[0] ? solutions[0].join("") : null,
    solutionCount: solutions.length,
  };
}

export function isSolved(puzzle: Puzzle, solution: string): boolean {
  return puzzle.cells.map((cell) => cell.value ?? "0").join("") === solution;
}

function search(
  board: Array<Digit | null>,
  solutions: Digit[][],
  maxSolutions: number,
): void {
  if (solutions.length >= maxSolutions) {
    return;
  }

  const next = findMostConstrainedCell(board);
  if (!next) {
    solutions.push(board.slice() as Digit[]);
    return;
  }

  for (const digit of next.candidates) {
    board[next.index] = digit;
    search(board, solutions, maxSolutions);
    board[next.index] = null;
  }
}

function findMostConstrainedCell(
  board: Array<Digit | null>,
): { index: number; candidates: Digit[] } | null {
  let best: { index: number; candidates: Digit[] } | null = null;

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) {
      continue;
    }

    const candidates = ALL_DIGITS.filter(
      (digit) => !boardHasPeerConflict(board, index, digit),
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

function boardHasPeerConflict(
  board: Array<Digit | null>,
  index: number,
  digit: Digit,
): boolean {
  return peerIndexes(index).some((peerIndex) => board[peerIndex] === digit);
}

function peerIndexes(index: number): number[] {
  const row = Math.floor(index / 9);
  const column = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxColumn = Math.floor(column / 3) * 3;
  const peers = new Set<number>();

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

function assertIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= PUZZLE_LENGTH) {
    throw new Error("Cell index must be between 0 and 80.");
  }
}
