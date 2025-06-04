import type {ProblemLevel} from "../enums/ProblemLevel.ts";

export interface GetProblemResponse {
  name: string;
  description: string;
  level: ProblemLevel;
}