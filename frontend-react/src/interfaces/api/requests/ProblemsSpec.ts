import type {ProblemLevel} from "../enums/ProblemLevel.ts";
import type {SortDirection} from "../enums/SortDirection.ts";

export default interface ProblemsSpec {
  name?: string;
  level?: ProblemLevel;
  take: number;
  page: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
