# Ninefold Daily

This context names the player-facing Sudoku concepts for Ninefold Daily. It keeps the rules, puzzle flow, and progression language stable while implementation details stay elsewhere.

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

**Generated Puzzle**:
A puzzle created by the game for endless play and rated by the solver before it receives a difficulty.
_Avoid_: Random board, generated level

**Starter Bank**:
A curated set of puzzles shipped with the game to make the first difficulties reliable.
_Avoid_: Sample puzzles, seed list

**Daily Puzzle**:
A date-specific puzzle intended to support streaks, archive play, and repeat visits.
_Avoid_: Challenge of the day, daily level

**Archive Puzzle**:
A past daily puzzle that remains freely playable without changing streak eligibility.
_Avoid_: Old daily, backlog puzzle

**Streak**:
A count of consecutive days on which the player completes the daily puzzle.
_Avoid_: Chain, run

**Completion Count**:
The number of puzzles the player has finished.
_Avoid_: Wins, clears

**Best Time**:
The player's fastest completion time for a difficulty.
_Avoid_: High score, record

**Hint Step**:
One level in the game's escalating assistance, from directional guidance to explanation to optional reveal.
_Avoid_: Hint tier, cheat level

**Selected Cell**:
The cell that will receive number, note, or clear actions from the player.
_Avoid_: Active square, focused tile

**Selected Digit**:
The digit the player can apply repeatedly to cells during number-first play.
_Avoid_: Active number, chosen value

**Note Mode**:
The input state where digit actions add or remove notes instead of entries.
_Avoid_: Pencil mode, candidate mode

**Conflict Highlight**:
Visual feedback that identifies matching digits and direct row, column, or box conflicts.
_Avoid_: Error highlight, warning glow

**Completion Check**:
Validation that reports whether the current puzzle state is solved or still contains unresolved work.
_Avoid_: Submit, final answer

**Pause**:
An explicit player action that stops the timer behind an overlay.
_Avoid_: Break, background pause

**Saved Puzzle State**:
The locally persisted in-progress puzzle, including entries, notes, timer, mistakes, completion status, and settings.
_Avoid_: Save file, session cache

**Solver**:
The game's logic for validating puzzles, finding next useful hint steps, and later rating generated puzzle difficulty.
_Avoid_: AI, answer engine

**Technique Label**:
The optional Sudoku technique name associated with a hint step.
_Avoid_: Hint title, strategy badge

**Theme**:
The visual color treatment the player can choose without changing the rules or puzzle state.
_Avoid_: Skin, palette

**Reduced Motion**:
A setting that limits nonessential animation while preserving game feedback.
_Avoid_: Accessibility mode, low motion

**Sound Cue**:
A short generated audio response for actions such as entry, note, mistake, completion, or button selection.
_Avoid_: Sound effect, audio asset
