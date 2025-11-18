# Caissa Chess Evaluator - AI Coding Instructions

## Project Overview
Caissa is a **Next.js chess skill evaluation application** that assesses students through a 3-question form followed by 6 interactive chess puzzles of increasing difficulty. The app uses chess.js for move validation and react-chessboard for the UI.

**Key Components**: State-orchestrated app → Progressive screens (Welcome → Questions → Puzzles → Results)

---

## Critical Architecture Patterns

### 1. **State Machine Flow** (`src/app/page.tsx`)
The app follows a strict 4-state lifecycle:
- `"welcome"` → `"questions"` → `"puzzles"` → `"results"`
- **Stopping Rule**: Evaluation terminates after 2 incorrect puzzles (tracked via `wrongCount`)
- **Level Calculation**: Based on which puzzle first fails (see `calculateLevel()` logic)
- Each state transition resets relevant substates (e.g., puzzle index, results array)

**Why This Matters**: Always respect this flow when modifying evaluation logic. The `wrongCount` counter is critical—don't modify without understanding the stop condition.

### 2. **Puzzle State Management** (`src/components/PuzzleBoard.tsx`)
Puzzles contain **both student and opponent moves**:
- `solution`: Student's correct moves in UCI format (`"e2e4"`)
- `opponentMoves`: Opponent's automatic responses (only these are indexed by student move index)
- Move validation is **position-based**: Compare `moveUCI` (exact string) against `puzzle.solution[moveHistory.length]`

**Common Pitfall**: Opponent moves are played via `playOpponentMove()` with 800ms delay for UX. Removing this breaks the interaction rhythm.

### 3. **FEN State Synchronization**
The PuzzleBoard maintains three position representations:
- `game` (Chess.js instance)
- `boardPosition` (Chessboard render state)
- `puzzle.fen` (initial position)

**When Resetting**: Always reset all three in sync (see `useEffect` on `puzzle.fen` dependency). Mismatches cause board rendering bugs.

---

## Developer Workflows

### Running the App
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check (TypeScript strict mode enforced)
```

### Adding/Modifying Puzzles
Edit `src/data/puzzles.ts`. Each puzzle needs:
- **id**: Unique 1-6 (matched in `calculateLevel`)
- **fen**: Valid FEN string (test with chess.js locally)
- **solution**: Array of student's moves only (UCI format)
- **opponentMoves**: Opponent's responses (length = `solution.length - 1` for mate-in-N)

**Example**: For mate-in-2, `solution` = 2 moves, `opponentMoves` = 1 move (between them).

### Debugging Puzzles
- Console logs show: `"Expected FEN"`, `"Board Position"`, `"Game FEN"` in PuzzleBoard
- Check that `solution` moves are legal in the starting FEN position
- Use chess.js in Node to validate: `new Chess(fen).move({from, to})`

---

## Project-Specific Conventions

### TypeScript & Component Structure
- **Interfaces** in same file (e.g., `Answers` in `QuestionScreen.tsx`, `PuzzleResult` in `page.tsx`)
- **Client Components**: All interactive components use `"use client"` (Next.js requirement)
- **Props Pattern**: Explicit handler callbacks (`onStart`, `onComplete`, `onSolve`, `onRestart`) for state lifting

### Styling
- **Tailwind CSS** only (no CSS modules)
- **Dark mode**: Conditional classes (`dark:` prefix) on every UI element
- **Gradients**: Consistent `from-blue-50 to-indigo-100` (light) / `from-gray-900 to-gray-800` (dark)
- **Component Hierarchy**: Wrapped in centered max-width container with shadow & rounded corners

### Chess Logic
- **Move Validation**: chess.js handles legality; app checks correctness (solution match)
- **Checkmate Not Explicitly Checked**: Only verifies move count matches solution length
- **Promotion Defaults to Queen** (`promotion: "q"`) for all moves
- **No Undo/Takebacks**: Single-attempt per puzzle only

---

## Cross-Component Communication

```
page.tsx (orchestrator)
├─→ WelcomeScreen: onStart() → setState("questions")
├─→ QuestionScreen: onComplete(Answers) → setState("puzzles")
├─→ PuzzleBoard: onSolve(boolean) → processResult() → setState() or next puzzle
└─→ ResultScreen: onRestart() → setState("welcome"), clear all data
```

**Data Flow**: State held in `page.tsx`, passed down as props, children communicate only via callbacks (no context/Redux).

---

## Key Files & When to Edit

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/app/page.tsx` | State orchestration, level logic | Changing evaluation rules, state flow, or level assignment criteria |
| `src/data/puzzles.ts` | Puzzle definitions | Adding/modifying puzzles or opponent moves |
| `src/components/PuzzleBoard.tsx` | Chess board UI & move logic | Changing move validation, board behavior, or feedback timing |
| `src/components/QuestionScreen.tsx` | Question form | Adding questions or changing question logic |
| `src/components/ResultScreen.tsx` | Results display | Changing result presentation or score breakdown |

---

## Testing Notes
- **No automated tests** currently; manual testing required
- **Test Workflow**: Run `npm run dev`, test each puzzle end-to-end, verify level assignment
- **Edge Cases**: Invalid FEN, empty puzzles array, puzzle with no opponent moves, 2-fail stop condition
- **Browser Console**: Check for chess.js errors when debugging position issues

---

## Tech Stack Summary
- **Next.js 16** (App Router, `"use client"` required)
- **React 19** with TypeScript strict mode
- **chess.js 1.4.0**: Move validation & FEN parsing
- **react-chessboard 5.8.4**: Drag-and-drop board UI
- **Tailwind CSS 4** with PostCSS
- **ESLint** with Next.js config
