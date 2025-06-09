import type {ProblemLevel} from "../enums/ProblemLevel.ts";

export default interface UpdateProblemRequest {
  name?: string;
  description?: string;
  problemLevel?: ProblemLevel;
}