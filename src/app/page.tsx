"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import QuestionScreen, { Answers } from "@/components/QuestionScreen";
import PuzzleBoard from "@/components/PuzzleBoard";
import ResultScreen from "@/components/ResultScreen";
import { puzzles } from "@/data/puzzles";

type AppState = "welcome" | "questions" | "puzzles" | "results";

interface PuzzleResult {
  puzzleId: number;
  puzzleName: string;
  solved: boolean;
}

export default function Home() {
  const [state, setState] = useState<AppState>("welcome");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<PuzzleResult[]>([]);
  const [wrongCount, setWrongCount] = useState(0);

  const handleStart = () => {
    setState("questions");
  };

  const handleQuestionsComplete = (userAnswers: Answers) => {
    setAnswers(userAnswers);
    setState("puzzles");
    setCurrentPuzzleIndex(0);
    setPuzzleResults([]);
    setWrongCount(0);
  };

  const handlePuzzleSolve = (solved: boolean) => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    const newResult: PuzzleResult = {
      puzzleId: currentPuzzle.id,
      puzzleName: currentPuzzle.name,
      solved,
    };

    const updatedResults = [...puzzleResults, newResult];
    setPuzzleResults(updatedResults);

    if (!solved) {
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);

      // Stop after second wrong puzzle
      if (newWrongCount >= 2) {
        const level = calculateLevel(updatedResults);
        setState("results");
        return;
      }
    }

    // Move to next puzzle or finish
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // All puzzles completed
      const level = calculateLevel(updatedResults);
      setState("results");
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
  };

  const assignedLevel = answers ? calculateLevel(puzzleResults) : 1;

  return (
    <main>
      {state === "welcome" && <WelcomeScreen onStart={handleStart} />}
      {state === "questions" && (
        <QuestionScreen onComplete={handleQuestionsComplete} />
      )}
      {state === "puzzles" && (
        <PuzzleBoard
          puzzle={puzzles[currentPuzzleIndex]}
          puzzleNumber={currentPuzzleIndex + 1}
          totalPuzzles={puzzles.length}
          onSolve={handlePuzzleSolve}
        />
      )}
      {state === "results" && answers && (
        <ResultScreen
          answers={answers}
          puzzleResults={puzzleResults}
          assignedLevel={assignedLevel}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
