# Quick Reference: PGN Converter

## 🚀 Quick Start

### 1. Add Your PGN Puzzles
Edit `scripts/convertPgnToJson.ts`:

```typescript
const level1Puzzles: PuzzleInputWithPgn[] = [
  {
    id: 1,
    name: "Your puzzle name",
    pgn: "1. e4 e5 2. Nf3 Nc6 ...",           // Your PGN here
    solution: ["e2e4", "e7e5"],               // Moves in UCI format
    opponentMoves: ["e7e5"],                  // Optional: opponent moves
    difficulty: "Easy",                       // Optional
  },
  // Add more puzzles...
];
```

### 2. Run the Converter
```bash
npx ts-node scripts/convertPgnToJson.ts
```

### 3. Check Output
- `src/data/level1Puzzles.json`
- `src/data/level2Puzzles.json`
- `src/data/level3Puzzles.json`

## 📋 Input Format

| Field | Example | Notes |
|-------|---------|-------|
| `id` | `1` | Unique per level |
| `name` | `"Mate in 1"` | Display name |
| `pgn` | `"1. e4 e5"` | Can be partial game |
| `solution` | `["e2e4"]` | UCI moves only |
| `opponentMoves` | `["e7e5"]` | Optional |
| `difficulty` | `"Easy"` | Optional |

## 📝 UCI Format Examples

```
Queen moves from e2 to e4:     "e2e4"
Knight from g1 to f3:         "g1f3"
Pawn promotion (e7 to e8=Q):  "e7e8q"
Castling kingside:            "e1g1"
```

## 🎯 Example Puzzle Entry

```typescript
{
  id: 1,
  name: "Mate in 1 - Back Rank",
  pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3",
  solution: ["e1e7"],        // Single move wins
  opponentMoves: [],         // No opponent moves for mate in 1
  difficulty: "Very Easy",
}
```

## ⚙️ How It Works

1. **Parse PGN** → `pgn2fen(pgn)` converts PGN to FEN
2. **Extract FEN** → Gets the starting position from your PGN
3. **Validate** → Skips invalid PGNs with warnings
4. **Save** → Writes to `level{1,2,3}Puzzles.json`

## 📊 Output Example

```json
[
  {
    "id": 1,
    "name": "Mate in 1 - Back Rank",
    "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4",
    "solution": ["e1e7"],
    "opponentMoves": [],
    "difficulty": "Very Easy"
  }
]
```

## ✅ What You Need to Provide

1. **PGN Strings**: Your puzzle positions in PGN format
2. **Solution Moves**: The correct moves in UCI format (e.g., `["e2e4", "e7e5"]`)
3. **Opponent Moves** (optional): What opponent plays automatically

## 🔗 File Structure

```
scripts/convertPgnToJson.ts         ← Edit this with your puzzles
↓
src/utils/pgnConverter.ts           ← Conversion logic
↓
src/data/level{1,2,3}Puzzles.json   ← Generated output files
```

## 💡 Tips

- **Partial PGNs**: You don't need full games, just moves to reach puzzle position
- **FEN Tags**: PGN `[FEN "..."]` tags are respected
- **Validation**: Invalid PGNs are auto-skipped with warnings
- **Scaling**: This approach works for 20+ puzzles per level

## 🆘 Common Issues

**"Invalid PGN"** → Check PGN syntax with chess.com validator
**Empty output** → Ensure IDs are unique and PGNs are valid
**Script fails** → Run from project root, ensure `npm install` completed

---

**Next Step**: Provide your PGN puzzles and we'll convert them! 🎯
