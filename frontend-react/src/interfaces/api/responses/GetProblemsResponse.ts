import type {ProblemLevel} from "../enums/ProblemLevel.ts";

export interface GetProblemResponse {
  id: number;
  name: string;
  description: string;
  level: ProblemLevel;
}