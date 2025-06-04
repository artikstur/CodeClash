export type ProblemLevel = 1 | 2 | 3;

export interface GetProblemResponse {
  name: string;
  description: string;
  level: ProblemLevel;
}