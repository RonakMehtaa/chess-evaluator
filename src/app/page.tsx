"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import QuestionScreen, { Answers } from "@/components/QuestionScreen";
import PuzzleBoard from "@/components/PuzzleBoard";
import ResultScreen from "@/components/ResultScreen";
import LevelDisplay from "@/components/LevelDisplay";
import CompletionScreen from "@/components/CompletionScreen";
import { puzzles } from "@/data/puzzles";
import { level1Puzzles, level2Puzzles, level3Puzzles, level4Puzzles } from "@/data/levelPuzzles";
import { saveUser, savePuzzleResult, updateFinalRating } from '../supabaseClient';

type AppState = "welcome" | "questions" | "puzzles" | "results" | "levelDisplay" | "levelPuzzles" | "completion";

interface PuzzleResult {
  puzzleId: number;
  puzzleName: string;
  solved: boolean;
}

export default function Home() {
  // Helper to safely parse points which may be a string in JSON
  const parsePoints = (val: any) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
    if (typeof val === "string") {
      // Try to parse integer portion
      const cleaned = val.replace(/[^0-9-]/g, "");
      const parsed = parseInt(cleaned, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const asNumber = Number(val);
    return Number.isFinite(asNumber) ? Math.floor(asNumber) : 0;
  };
  const [state, setState] = useState<AppState>("welcome");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<PuzzleResult[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [assignedLevel, setAssignedLevel] = useState(0);
  const [levelPuzzleResults, setLevelPuzzleResults] = useState<PuzzleResult[]>([]);
  const [levelWrongCount, setLevelWrongCount] = useState(0);

  const handleStart = () => {
    setState("questions");
  };

  const handleQuestionsComplete = async (userAnswers: Answers) => {
    setAnswers(userAnswers);
    const name = `${userAnswers.firstName ?? ''} ${userAnswers.lastName ?? ''}`.trim();
    // No email field on form; keep email empty. Clean phone to digits only before saving.
    const email = '';
    const cleanedPhone = userAnswers.phone ? String(userAnswers.phone).replace(/[^0-9+\-()\s]/g, '') : undefined;
    // Save all user info to Supabase
    const userData = await saveUser(
      name,
      email,
      userAnswers.yearsPlaying,
      userAnswers.knowsPieceMovement ?? false,
      userAnswers.playedTournaments ?? false,
      cleanedPhone
    );
    // Store userId for puzzle results
    if (userData && userData.id) {
      setUserId(userData.id);
    }
    setState("puzzles");
    setCurrentPuzzleIndex(0);
    setPuzzleResults([]);
    setWrongCount(0);
  };

  const handlePuzzleSolve = async (solved: boolean) => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    const newResult: PuzzleResult = {
      puzzleId: currentPuzzle.id,
      puzzleName: currentPuzzle.name,
      solved,
    };

    const updatedResults = [...puzzleResults, newResult];
    setPuzzleResults(updatedResults);
    // Add points if solved
    if (solved) {
      setTotalScore((prev) => prev + parsePoints(currentPuzzle.points));
    }

    if (!solved) {
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);

      // Stop after second wrong puzzle
      if (newWrongCount >= 2) {
        // Calculate tini (total initial score) up to the point of stopping
        const tini = updatedResults.reduce((acc, r) => {
          if (!r.solved) return acc;
          const p = puzzles.find(p => p.id === r.puzzleId);
          return acc + parsePoints(p?.points);
        }, 0);
        console.log('Computed initial total (tini) at stop:', tini);
  let level = 1;
  if (tini >= 200 && tini < 350) level = 2;
  else if (tini >= 350 && tini < 500) level = 3;
  else if (tini >= 500 && tini < 650) level = 4;
        setAssignedLevel(level);

        // Decide baseline (start of range) for the assigned level.
        // Adjust these values if you want different baseline starts.
        const baselineForLevel = (lvl: number) => {
          switch (lvl) {
            case 1:
              return 0; // Corrected baseline for level 1
            case 2:
              return 200; // Corrected baseline for level 2
            case 3:
              return 350;
            case 4:
              return 500;
            default:
              return 0;
          }
        };

        const baseline = baselineForLevel(level);

        // If the player's initial rating is already greater than 650,
        // don't show level puzzles — show final rating/results instead.
        if (tini > 650) {
          // Use tini as final rating
          setTotalScore(tini);
          if (userId) {
            try {
              await updateFinalRating(userId, tini);
            } catch (err) {
              console.error('Failed to update final rating when skipping levels:', err);
            }
            // Save initial evaluation puzzle results
            for (const result of updatedResults) {
              await savePuzzleResult(userId, 0, result.puzzleId, result.solved);
            }
          }
          setState("results");
          return;
        }

        // Set in-memory total to baseline so level puzzles add on top of this
        setTotalScore(baseline);

        // Persist baseline into final_rating for this user if available
        if (userId) {
          try {
            await updateFinalRating(userId, baseline);
          } catch (err) {
            console.error('Failed to update final rating on stop:', err);
          }
        }

        setState("levelDisplay");
        return;
      }
    }

    // Move to next puzzle or finish
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // All puzzles completed
      // Calculate tini (total initial score)
      const tini = updatedResults.reduce((acc, r) => {
        if (!r.solved) return acc;
        const p = puzzles.find(p => p.id === r.puzzleId);
        return acc + parsePoints(p?.points);
      }, 0);
      console.log('Computed initial total (tini) on completion:', tini);
      let level = 1;
      if (tini >= 200 && tini < 350) level = 2;
      else if (tini >= 350 && tini < 500) level = 3;
      else if (tini >= 500 && tini < 650) level = 4;
      setAssignedLevel(level);

      // Persist baseline final rating for this user if available (we'll add level puzzle points on top)
      // baseline helper
      const baselineForLevel = (lvl: number) => {
        switch (lvl) {
          case 1:
            return 0;
          case 2:
            return 200;
          case 3:
            return 350;
          case 4:
            return 500;
          default:
            return 0;
        }
      };
      const baseline = baselineForLevel(level);

      // If initial rating exceeds 650, skip level puzzles and show results
      if (tini > 650) {
        setTotalScore(tini);
        if (userId) {
          try {
            await updateFinalRating(userId, tini);
            // Save all initial evaluation puzzle results to DB
            for (const result of updatedResults) {
              await savePuzzleResult(userId, 0, result.puzzleId, result.solved);
            }
          } catch (err) {
            console.error('Failed to update final rating on completion when skipping levels:', err);
          }
        }
        setState("results");
        return;
      }

      // Set in-memory total to baseline so level puzzles add on top of this
      setTotalScore(baseline);
      if (userId) {
        try {
          await updateFinalRating(userId, baseline);
        } catch (err) {
          console.error('Failed to update final rating on completion:', err);
        }
      }
      // Save all initial evaluation puzzle results to DB
      if (userId) {
        for (const result of updatedResults) {
          await savePuzzleResult(userId, 0, result.puzzleId, result.solved);
        }
      }
      // Always go to levelDisplay after initial evaluation, never directly to results
      setState("levelDisplay");
    }
  };

  const calculateLevel = (results: PuzzleResult[]): number => {
    // Find which puzzles were solved/failed
    const puzzle1Solved = results.find((r) => r.puzzleId === 1)?.solved ?? false;
    const puzzle2Solved = results.find((r) => r.puzzleId === 2)?.solved ?? false;
    const puzzle3Solved = results.find((r) => r.puzzleId === 3)?.solved ?? false;
    const puzzle4Solved = results.find((r) => r.puzzleId === 4)?.solved ?? false;
    const puzzle5Solved = results.find((r) => r.puzzleId === 5)?.solved ?? false;
    const puzzle6Solved = results.find((r) => r.puzzleId === 6)?.solved ?? false;

    // Level assignment logic:
    // If unable to solve any mate in 1 puzzle: Level 1
    if (!puzzle1Solved && !puzzle2Solved) {
      return 1;
    }

    // If unable to solve very easy mate in 2: Level 2
    if (!puzzle3Solved) {
      return 2;
    }

    // If can solve very easy mate in 2 but fails medium mate in 2: Level 3
    if (puzzle3Solved && !puzzle4Solved) {
      return 3;
    }

    // If fails mate in 3: Level 4
    if (!puzzle5Solved) {
      return 4;
    }

    // If fails mate in 4: Level 5
    if (!puzzle6Solved) {
      return 5;
    }

    // If solves all puzzles: Level 6
    return 6;
  };

  const handleRestart = () => {
    setState("welcome");
    setAnswers(null);
    setCurrentPuzzleIndex(0);
    setPuzzleResults([]);
    setWrongCount(0);
    setAssignedLevel(0);
    setLevelPuzzleResults([]);
    setLevelWrongCount(0);
  };

  const handleLevelDisplayContinue = () => {
    // Ensure totalScore is set to baseline for the assigned level before starting
    const baselineForLevel = (lvl: number) => {
      switch (lvl) {
        case 1:
          return 0;
        case 2:
          return 200;
        case 3:
          return 350;
        case 4:
          return 500;
        default:
          return 0;
      }
    };
    const baseline = baselineForLevel(assignedLevel);
    setTotalScore(baseline);
    if (userId) {
      updateFinalRating(userId, baseline).catch((err) => console.error('Failed to persist baseline on start level puzzles:', err));
    }
    setState("levelPuzzles");
    setCurrentPuzzleIndex(0);
    setLevelPuzzleResults([]);
    setLevelWrongCount(0);
  };

  const getLevelPuzzles = () => {
    switch (assignedLevel) {
      case 1:
        return level1Puzzles;
      case 2:
        return level2Puzzles;
      case 3:
        return level3Puzzles;
      case 4:
        return level4Puzzles;
      // If level 5/6 not implemented, fall back to level4 puzzles
      case 5:
      case 6:
        return level4Puzzles;
      default:
        return level1Puzzles;
    }
  };

  const handleLevelPuzzleSolve = async (solved: boolean) => {
    const levelPuzzles = getLevelPuzzles();
    const currentPuzzle = levelPuzzles[currentPuzzleIndex];
    const newResult: PuzzleResult = {
      puzzleId: currentPuzzle.id,
      puzzleName: currentPuzzle.name,
      solved,
    };

    const updatedResults = [...levelPuzzleResults, newResult];
    setLevelPuzzleResults(updatedResults);

    // Add points if solved (for level puzzles) — compute new total relative to baseline
    let newTotal = totalScore ?? 0;
    if (solved) {
      const pts = parsePoints(currentPuzzle.points);
      newTotal = newTotal + pts;
      setTotalScore(newTotal);
    }

    // Save puzzle result for this user
    if (userId) {
      await savePuzzleResult(userId, assignedLevel, currentPuzzle.id, solved);
      // Persist updated final rating after each level puzzle
      if (solved) {
        try {
          await updateFinalRating(userId, newTotal);
        } catch (err) {
          console.error('Failed to update final rating after level puzzle:', err);
        }
      }
    }

    // Continue through all level puzzles; redirect to results after the last one
    if (currentPuzzleIndex < levelPuzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setState("results");
    }
  };



  return (
    <main>
      {state === "welcome" && <WelcomeScreen onStart={handleStart} />}
      {state === "questions" && (
        <QuestionScreen onComplete={handleQuestionsComplete} />
      )}
      {state === "puzzles" && (
        <div className="flex flex-col items-center">
          <PuzzleBoard
            puzzle={puzzles[currentPuzzleIndex]}
            puzzleNumber={currentPuzzleIndex + 1}
            totalPuzzles={puzzles.length}
            onSolve={handlePuzzleSolve}
            currentRating={totalScore}
          />
          <button
            className="mt-6 px-4 py-2 rounded bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
            onClick={async () => {
              // Calculate tini from puzzleResults
              const tini = puzzleResults.reduce((acc, r) => {
                if (!r.solved) return acc;
                const p = puzzles.find(p => p.id === r.puzzleId);
                return acc + parsePoints(p?.points);
              }, 0);

              // Save all puzzleResults to DB for this user
              if (userId) {
                for (const result of puzzleResults) {
                  await savePuzzleResult(userId, 0, result.puzzleId, result.solved);
                }
              }

              // If initial rating exceeds 650, skip level puzzles and show results
              if (tini > 650) {
                setTotalScore(tini);
                if (userId) {
                  try {
                    await updateFinalRating(userId, tini);
                  } catch (err) {
                    console.error('Failed to update final rating when skipping levels from End Evaluation:', err);
                  }
                }
                setState("results");
                return;
              }

              // Otherwise go to levelDisplay after initial evaluation
              setState("levelDisplay");
            }}
          >
            End Evaluation
          </button>
        </div>
      )}
      {state === "levelDisplay" && (
        <LevelDisplay level={assignedLevel} tini={
          puzzleResults.reduce((acc, r) => {
            if (!r.solved) return acc;
            const p = puzzles.find(p => p.id === r.puzzleId);
            return acc + parsePoints(p?.points);
          }, 0)
        } onContinue={handleLevelDisplayContinue} />
      )}
      {state === "levelPuzzles" && (
        <div className="flex flex-col items-center">
          <PuzzleBoard
            puzzle={getLevelPuzzles()[currentPuzzleIndex]}
            puzzleNumber={currentPuzzleIndex + 1}
            totalPuzzles={getLevelPuzzles().length}
            onSolve={handleLevelPuzzleSolve}
            currentRating={totalScore}
          />
          <button
            className="mt-6 px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700 transition"
            onClick={() => setState("results")}
          >
            End Evaluation
          </button>
        </div>
      )}
      {state === "completion" && (
        <CompletionScreen level={assignedLevel} onRestart={handleRestart} />
      )}
      {state === "results" && answers && (
        <ResultScreen
          answers={answers}
          totalScore={totalScore}
          assignedLevel={assignedLevel}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
