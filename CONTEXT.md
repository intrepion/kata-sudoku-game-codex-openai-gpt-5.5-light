# Sudoku Game

This context names the player-facing Sudoku concepts for the game. It keeps the rules, puzzle flow, and progression language stable while implementation details stay elsewhere.

## Language

**Puzzle**:
A single Sudoku challenge with a fixed starting grid and one valid completed solution.
_Avoid_: Board, level, map

**Grid**:
The 9 by 9 play surface made of rows, columns, boxes, and cells.
_Avoid_: Board, matrix

**Cell**:
One square in the grid that may be a given, an entered digit, or empty.
_Avoid_: Tile, square

**Given**:
A digit provided by the puzzle at the start that the player cannot change.
_Avoid_: Clue, locked number

**Entry**:
A player-entered digit placed into an empty cell.
_Avoid_: Guess, answer

**Note**:
A small candidate digit the player records in a cell without committing it as an entry.
_Avoid_: Pencil mark, annotation

**Mistake**:
An entry that conflicts with the puzzle solution and is counted by the game.
_Avoid_: Error, foul

**Hint**:
Assistance the game gives when the player asks for help.
_Avoid_: Cheat, reveal

**Difficulty**:
The game's rating of how demanding a puzzle is expected to feel.
_Avoid_: Level, rank

**Daily Puzzle**:
A date-specific puzzle intended to support streaks, archive play, and repeat visits.
_Avoid_: Challenge of the day, daily level

**Streak**:
A count of consecutive days on which the player completes the daily puzzle.
_Avoid_: Chain, run
