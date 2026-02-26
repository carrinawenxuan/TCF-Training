import type { TCFLevel } from "./question";

export interface KnowledgePoint {
  id: string;
  name: string;
  level: TCFLevel;
  description: string;
  examples?: string[];
}
