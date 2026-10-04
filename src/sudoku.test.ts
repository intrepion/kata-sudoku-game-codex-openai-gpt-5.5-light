import { describe, expect, it } from "vitest";
import {
  ALL_DIGITS,
  candidatesFor,
  hasPeerConflict,
  parsePuzzle,
  solvePuzzle,
} from "./sudoku";
import { STARTER_PUZZLES } from "./starter-bank";

describe("Sudoku engine", () => {
  it("parses a puzzle into givens and editable cells", () => {
    const puzzle = parsePuzzle(
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    );

    expect(puzzle.cells[0]).toEqual({ value: 5, given: true });
    expect(puzzle.cells[2]).toEqual({ value: null, given: false });
    expect(puzzle.cells).toHaveLength(81);
  });

  it("rejects malformed puzzle strings", () => {
    expect(() => parsePuzzle("123")).toThrow(/81 cells/);
    expect(() => parsePuzzle("x".repeat(81))).toThrow(/digits/);
  });

  it("finds candidates from row, column, and box peers", () => {
    const puzzle = parsePuzzle(
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    );

    expect(candidatesFor(puzzle, 2)).toEqual([1, 2, 4]);
    expect(candidatesFor(puzzle, 0)).toEqual([]);
  });

  it("detects row, column, and box conflicts", () => {
    const puzzle = parsePuzzle("1" + "0".repeat(80));

    expect(hasPeerConflict(puzzle, 1, 1)).toBe(true);
    expect(hasPeerConflict(puzzle, 9, 1)).toBe(true);
    expect(hasPeerConflict(puzzle, 10, 1)).toBe(true);
    expect(hasPeerConflict(puzzle, 80, 1)).toBe(false);
  });

  it("solves a uniquely solvable puzzle", () => {
    const puzzle = parsePuzzle(
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    );

    expect(solvePuzzle(puzzle)).toEqual({
      solution:
        "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
      solutionCount: 1,
    });
  });

  it("ships 12 verified starter puzzles across three difficulties", () => {
    expect(STARTER_PUZZLES).toHaveLength(12);
    expect(STARTER_PUZZLES.filter((puzzle) => puzzle.difficulty === "easy")).toHaveLength(4);
    expect(STARTER_PUZZLES.filter((puzzle) => puzzle.difficulty === "medium")).toHaveLength(4);
    expect(STARTER_PUZZLES.filter((puzzle) => puzzle.difficulty === "hard")).toHaveLength(4);
    expect(new Set(STARTER_PUZZLES.map((puzzle) => puzzle.givens)).size).toBe(12);

    for (const starter of STARTER_PUZZLES) {
      const puzzle = parsePuzzle(starter.givens);
      const solved = solvePuzzle(puzzle);

      expect(starter.givens).not.toBe(starter.solution);
      expect(solved.solutionCount, starter.id).toBe(1);
      expect(solved.solution, starter.id).toBe(starter.solution);
    }
  });

  it("uses digits one through nine as the domain alphabet", () => {
    expect(ALL_DIGITS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
