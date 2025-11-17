# Caissa Chess Evaluator

A complete chess level evaluation app built with Next.js, React, and TypeScript. This app evaluates a student's chess level through a 3-question form and 6 chess puzzles.

## Features

- **Welcome Screen**: Introduces the evaluation process
- **Questionnaire**: Collects basic information about the student's chess experience
- **Interactive Puzzles**: 6 chess puzzles of increasing difficulty
- **Real-time Validation**: Uses chess.js to validate moves
- **Level Assignment**: Automatically assigns a level (1-6) based on performance
- **Results Screen**: Displays comprehensive evaluation results

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **react-chessboard**: Chess board UI component
- **chess.js**: Chess logic and move validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
caissa/
├── src/
│   ├── app/
│   │   └── page.tsx          # Main app orchestrator
│   ├── components/
│   │   ├── WelcomeScreen.tsx # Welcome screen component
│   │   ├── QuestionScreen.tsx # Questionnaire component
│   │   ├── PuzzleBoard.tsx   # Chess puzzle board component
│   │   └── ResultScreen.tsx  # Results display component
│   └── data/
│       └── puzzles.ts        # Puzzle data (FEN + solutions)
├── public/                   # Static assets
└── package.json
```

## Puzzle Format

Puzzles are defined in `src/data/puzzles.ts`. Each puzzle contains:

- `id`: Unique identifier
- `name`: Display name
- `difficulty`: Difficulty level
- `fen`: Starting position in FEN notation
- `solution`: Array of moves in UCI format (e.g., `["e2e4", "e7e5"]`)

### Adding/Updating Puzzles

To add or update puzzles, edit `src/data/puzzles.ts`:

```typescript
{
  id: 1,
  name: "Very Easy Mate in 1",
  difficulty: "Very Easy",
  fen: "r1bqkb1r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
  solution: ["f6f7"], // Student's moves only in UCI format
}
```

**Note**: The `solution` array should contain only the student's moves (not opponent responses). The moves are in UCI format: `[fromSquare][toSquare]` (e.g., `"e2e4"`).

## Level Assignment Logic

The app assigns levels based on puzzle performance:

- **Level 1**: Unable to solve any mate in 1 puzzle
- **Level 2**: Unable to solve very easy mate in 2
- **Level 3**: Can solve very easy mate in 2 but fails medium mate in 2
- **Level 4**: Fails mate in 3
- **Level 5**: Fails mate in 4
- **Level 6**: Solves all puzzles

The evaluation stops immediately after the student gets their second incorrect puzzle.

## How It Works

1. **Welcome Screen**: Student clicks "Begin Evaluation"
2. **Questions**: Student answers 3 questions about their chess experience
3. **Puzzles**: Student solves puzzles one by one
   - Each puzzle validates moves in real-time
   - Feedback is shown for correct/incorrect moves
   - Evaluation stops after 2 wrong puzzles
4. **Results**: Student sees their assigned level, answers, and puzzle results

## Customization

### Styling

The app uses Tailwind CSS. Modify component files to change styling.

### Puzzle Validation

Puzzle validation logic is in `src/components/PuzzleBoard.tsx`. The component:
- Uses chess.js to validate moves
- Compares student moves against the solution
- Checks for checkmate at puzzle completion

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
