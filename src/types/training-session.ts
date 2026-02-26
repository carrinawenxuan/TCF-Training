import type { TCFModule } from "./question";

export interface TrainingSession {
  id: string;
  module: TCFModule;
  startedAt: string;
  endedAt?: string;
  questionIds: string[];
  answers: Record<string, string>;
  scores?: Record<string, number>;
}
