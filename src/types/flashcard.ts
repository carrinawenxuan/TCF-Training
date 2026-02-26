import type { TCFLevel } from "./question";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  context: string;
  sourceQuestionId: string;
  knowledgePointId: string;
  level: TCFLevel;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
}
