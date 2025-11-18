# PGN to FEN Converter Utility

## Overview
This utility converts chess puzzles from PGN format to FEN format and saves them as JSON files for use in the Caissa Chess Evaluator.

## File Structure
```
src/utils/pgnConverter.ts        # Main converter utility functions
scripts/convertPgnToJson.ts      # Example script showing how to use the converter
src/data/level1Puzzles.json      # Output: Level 1 puzzles (will be auto-generated)
src/data/level2Puzzles.json      # Output: Level 2 puzzles (will be auto-generated)
src/data/level3Puzzles.json      # Output: Level 3 puzzles (will be auto-generated)
```

## Available Functions

### 1. `pgn2fen(pgn: string): string`
Converts a PGN string to FEN format.

```typescript
import { pgn2fen } from '../src/utils/pgnConverter';

const pgn = "1. e4 e5 2. Nf3 Nc6";
const fen = pgn2fen(pgn);
console.log(fen); // Output: FEN string
```

### 2. `convertPuzzlesFromPgn(puzzles: PuzzleInputWithPgn[]): PuzzleOutputWithFen[]`
Converts an array of puzzles with PGN to puzzles with FEN.

```typescript
import { convertPuzzlesFromPgn } from '../src/utils/pgnConverter';

const puzzles = [
  {
    id: 1,
    name: "Mate in 1",
    pgn: "1. e4 e5 2. Nf3",
    solution: ["f3e5"],
  }
];

const converted = convertPuzzlesFromPgn(puzzles);
```

### 3. `savePuzzlesToJson(puzzles: PuzzleOutputWithFen[], outputPath: string): boolean`
Saves converted puzzles to a JSON file.

```typescript
import { savePuzzlesToJson } from '../src/utils/pgnConverter';

savePuzzlesToJson(convertedPuzzles, 'src/data/level1Puzzles.json');
```

### 4. `convertAndSavePuzzles(inputPuzzles: PuzzleInputWithPgn[], outputLevel: 1 | 2 | 3): boolean`
Main function that orchestrates the entire conversion and saving process.

```typescript
import { convertAndSavePuzzles } from '../src/utils/pgnConverter';

const puzzles = [ /* your puzzle data */ ];
convertAndSavePuzzles(puzzles, 1); // Converts and saves to level1Puzzles.json
```

## Input Format

Each puzzle object needs:

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `id` | number | Yes | `1` | Unique identifier within the level |
| `name` | string | Yes | `"Mate in 1"` | Display name for the puzzle |
| `pgn` | string | Yes | `"1. e4 e5"` | PGN string (can be partial) |
| `solution` | string[] | Yes | `["e2e4"]` | Correct moves in UCI format |
| `opponentMoves` | string[] | No | `["e7e5"]` | Opponent's automatic responses |
| `difficulty` | string | No | `"Easy"` | Difficulty description |

## Example Usage

### Step 1: Prepare Your Data
Edit `scripts/convertPgnToJson.ts` and add your puzzles:

```typescript
const level1Puzzles: PuzzleInputWithPgn[] = [
  {
    id: 1,
    name: "Mate in 1 - Back Rank",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6",
    solution: ["b5a6"],
    opponentMoves: [],
    difficulty: "Very Easy",
  },
  // Add more puzzles...
];
```

### Step 2: Run the Converter
```bash
npx ts-node scripts/convertPgnToJson.ts
```

### Step 3: Verify Output
Check the generated JSON files:
- `src/data/level1Puzzles.json`
- `src/data/level2Puzzles.json`
- `src/data/level3Puzzles.json`

## Output Format

Each generated JSON file will contain an array of puzzles with FEN:

```json
[
  {
    "id": 1,
    "name": "Mate in 1 - Back Rank",
    "fen": "rnbqkbnr/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4",
    "solution": ["b5a6"],
    "opponentMoves": [],
    "difficulty": "Very Easy"
  }
]
```

## Tips for PGN Conversion

1. **Partial PGNs are OK**: You don't need complete games, just enough moves to reach your puzzle position
2. **FEN Tags**: If your PGN includes a `[FEN "..."]` tag, it will be used as the starting position
3. **Move Format**: Solutions and opponent moves must be in UCI format (e.g., "e2e4" not "e4")
4. **Validation**: Invalid PGNs are automatically skipped with a warning

## Integration with Puzzle Levels

Once you have generated the JSON files, you'll connect them in `src/data/levelPuzzles.ts` (done separately after conversion):

```typescript
import level1Data from './level1Puzzles.json';
import level2Data from './level2Puzzles.json';
import level3Data from './level3Puzzles.json';

export const level1Puzzles = level1Data;
export const level2Puzzles = level2Data;
export const level3Puzzles = level3Data;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid PGN" warning | Check the PGN syntax with a chess validator |
| Empty output JSON | Verify all puzzle IDs are unique and PGNs are valid |
| Script doesn't run | Make sure you're in the project root and have NodeJS installed |
| TypeScript errors | Run `npm install` to ensure all dependencies are installed |

## Workflow

1. **Collect Your Puzzles**: Get PGN strings from your database
2. **Format the Data**: Add them to the script in the correct format
3. **Run Converter**: Execute the script
4. **Verify Output**: Check the generated JSON files
5. **Connect to App**: Update levelPuzzles.ts to import the JSON (when ready)
6. **Test**: Run the app and verify puzzles load correctly

## Next Steps

After you've provided PGN puzzles and we've generated the JSON files, we'll:
1. Import the JSON into `src/data/levelPuzzles.ts`
2. Update the app to use the new puzzle data
3. Test the complete flow
