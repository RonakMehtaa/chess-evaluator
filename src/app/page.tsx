"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import QuestionScreen, { Answers } from "@/components/QuestionScreen";
import PuzzleBoard from "@/components/PuzzleBoard";
import ResultScreen from "@/components/ResultScreen";
import LevelDisplay from "@/components/LevelDisplay";
import CompletionScreen from "@/components/CompletionScreen";
import { puzzles } from "@/data/puzzles";
import { level1Puzzles, level2Puzzles, level3Puzzles } from "@/data/levelPuzzles";

type AppState = "welcome" | "questions" | "puzzles" | "results" | "levelDisplay" | "levelPuzzles" | "completion";

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
  const [assignedLevel, setAssignedLevel] = useState(0);
  const [levelPuzzleResults, setLevelPuzzleResults] = useState<PuzzleResult[]>([]);
  const [levelWrongCount, setLevelWrongCount] = useState(0);

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
        setAssignedLevel(level);
        setState("levelDisplay");
        return;
      }
    }

    // Move to next puzzle or finish
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // All puzzles completed
      const level = calculateLevel(updatedResults);
      setAssignedLevel(level);
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
      default:
        return level1Puzzles;
    }
  };

  const handleLevelPuzzleSolve = (solved: boolean) => {
    const levelPuzzles = getLevelPuzzles();
    const currentPuzzle = levelPuzzles[currentPuzzleIndex];
    const newResult: PuzzleResult = {
      puzzleId: currentPuzzle.id,
      puzzleName: currentPuzzle.name,
      solved,
    };

    const updatedResults = [...levelPuzzleResults, newResult];
    setLevelPuzzleResults(updatedResults);

    // Continue through all level puzzles; only go to completion after the last one
    if (currentPuzzleIndex < levelPuzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setState("completion");
    }
  };

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
      {state === "levelDisplay" && (
        <LevelDisplay level={assignedLevel} onContinue={handleLevelDisplayContinue} />
      )}
      {state === "levelPuzzles" && (
        <PuzzleBoard
          puzzle={getLevelPuzzles()[currentPuzzleIndex]}
          puzzleNumber={currentPuzzleIndex + 1}
          totalPuzzles={getLevelPuzzles().length}
          onSolve={handleLevelPuzzleSolve}
        />
      )}
      {state === "completion" && (
        <CompletionScreen level={assignedLevel} onRestart={handleRestart} />
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
