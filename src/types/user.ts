import type { TCFLevel, TCFModule } from "./question";

export interface AssistMode {
  showTranslation: "always" | "on-demand" | "after-answer" | "never";
  showWordByWord: "always" | "on-demand" | "never";
  showGrammarNotes: boolean;
  autoGenerateVocabCards: boolean;
  difficultyAssist: boolean;
}

export interface UserProfile {
  currentLevel: TCFLevel;
  targetLevel: TCFLevel;
  examDate?: string;
  assistMode: AssistMode;
  weaknesses: { module: TCFModule; points: string[] }[];
  strengths: string[];
  dailyGoalMinutes: number;
  streak: number;
}

export interface UserAnswer {
  id: string;
  questionId: string;
  module: TCFModule;
  timestamp: string;
  isCorrect?: boolean;
  score?: number;
  timeSpent: number;
  userResponse: string;
  aiFeedback?: string;
  weakPointsRevealed: string[];
  reviewCount: number;
  nextReviewDate: string;
  masteryLevel: number;
  usedAssist: boolean;
  assistUsed: string[];
}

/** A1 默认全辅助；随等级升高逐渐关闭 */
export function getDefaultAssistMode(currentLevel: TCFLevel): AssistMode {
  switch (currentLevel) {
    case "A1":
      return {
        showTranslation: "always",
        showWordByWord: "on-demand",
        showGrammarNotes: true,
        autoGenerateVocabCards: true,
        difficultyAssist: true,
      };
    case "A2":
      return {
        showTranslation: "on-demand",
        showWordByWord: "on-demand",
        showGrammarNotes: true,
        autoGenerateVocabCards: true,
        difficultyAssist: true,
      };
    case "B1":
      return {
        showTranslation: "after-answer",
        showWordByWord: "on-demand",
        showGrammarNotes: false,
        autoGenerateVocabCards: false,
        difficultyAssist: false,
      };
    default:
      return {
        showTranslation: "never",
        showWordByWord: "never",
        showGrammarNotes: false,
        autoGenerateVocabCards: false,
        difficultyAssist: false,
      };
  }
}

/** 题目等级比用户高 2 级以上时强制全辅助 */
export function shouldForceFullAssist(
  userLevel: TCFLevel,
  questionLevel: TCFLevel
): boolean {
  const levels: TCFLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.indexOf(questionLevel) - levels.indexOf(userLevel) >= 2;
}
