/**
 * TCF 题目核心类型（严格遵循规范）
 */

export type QuestionSource =
  | "official"
  | "screenshot_import"
  | "manual_import"
  | "ai_generated"
  | "ai_reinforcement";

export type QuestionStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "draft";

export type TCFModule = "CO" | "CE" | "EE" | "EO";
export type TCFLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// ===== 辅助理解数据（A1 用户） =====

export interface WordAnnotationWord {
  french: string;
  meaning: string;
  pos: string;
  isKey: boolean;
}

export interface WordAnnotation {
  sentence: string;
  words: WordAnnotationWord[];
}

export interface GrammarNote {
  pattern: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
  level: TCFLevel;
}

export interface VocabEntry {
  word: string;
  meaning: string;
  pos: string;
  pronunciation?: string;
  example: string;
  exampleTranslation: string;
  synonyms?: string[];
  antonyms?: string[];
  frequency: "high" | "medium" | "low";
}

export interface AssistData {
  questionTranslation: string;
  optionTranslations?: string[];
  passageTranslation?: string;
  wordByWord?: WordAnnotation[];
  grammarNotes?: GrammarNote[];
  keyVocabulary: VocabEntry[];
}

// ===== 基础题目 =====

export interface BaseQuestion {
  id: string;
  module: TCFModule;
  level: TCFLevel;
  tags: string[];
  knowledgePoints: string[];
  difficulty: number;
  source: QuestionSource;
  status: QuestionStatus;
  sourceNote: string;
  explanation: string;
  createdAt: string;
  parentQuestionId?: string;
  assist: AssistData;
}

export interface ListeningQuestion extends BaseQuestion {
  module: "CO";
  audioUrl?: string;
  audioText: string;
  audioConfig?: { voiceId: string; speed: number; language: "fr" };
  transcript: { start: number; end: number; text: string; translation: string }[];
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  distractorAnalysis: Record<string, string>;
}

export interface ReadingQuestion extends BaseQuestion {
  module: "CE";
  passage: string;
  passageType: "notice" | "email" | "ad" | "news" | "essay" | "letter";
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  synonymMap: { original: string; replaced: string; location: string }[];
}

export interface WritingTask extends BaseQuestion {
  module: "EE";
  prompt: string;
  taskLevel: 1 | 2 | 3;
  wordRange: { min: number; max: number };
  taskType: "letter" | "article" | "essay" | "message";
  requiredPoints: string[];
  formatRequirements: string[];
  sampleAnswer: string;
  scoringRubric: {
    relevance: string;
    structure: string;
    vocabulary: string;
    grammar: string;
    coherence: string;
  };
}

export interface SpeakingTask extends BaseQuestion {
  module: "EO";
  scenario: string;
  taskLevel: 1 | 2 | 3;
  prepTime: number;
  speakTime: number;
  guidedQuestions?: string[];
  sampleResponse: string;
  keyPhrases: string[];
  evaluationCriteria: string[];
}

export type AnyQuestion =
  | ListeningQuestion
  | ReadingQuestion
  | WritingTask
  | SpeakingTask;
