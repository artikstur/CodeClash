import type {ProblemLevel} from "../enums/ProblemLevel.ts";

export default interface AddProblemRequest {
  name: string;
  description: string;
  problemLevel: ProblemLevel;
}