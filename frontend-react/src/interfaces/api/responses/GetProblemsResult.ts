import type {GetProblemResponse} from "./GetProblemsResponse.ts";

export interface GetProblemsResult {
  items: GetProblemResponse[];
  count: number;
}