# PGN to FEN Converter Utility

## Overview
This utility was previously used to convert chess puzzles from PGN format to FEN format and save them as JSON files. However, the scripts and utilities for this process have been deprecated and removed.

## Current Status
- The PGN conversion process is no longer part of the project.
- All puzzle data is now directly managed in JSON files located in `src/data/`.

## File Structure
```
src/data/initialEvalPuzzles.json      # Initial evaluation puzzles
src/data/level1Puzzles.json           # Level 1 puzzles
src/data/level2Puzzles.json           # Level 2 puzzles
src/data/level3Puzzles.json           # Level 3 puzzles
src/data/levelPuzzles.ts              # Imports and exports puzzle data
```

## Next Steps
- If new puzzles need to be added, update the respective JSON files directly.
- Ensure that the JSON structure matches the expected format in the application.

## Troubleshooting
- Verify JSON syntax before adding new puzzles.
- Test the application to ensure puzzles load correctly after updates.
