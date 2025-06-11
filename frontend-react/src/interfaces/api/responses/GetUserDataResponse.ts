import type UserSolutionStatsDto from "../core/UserSolutionStatsDto.ts";

export default interface GetUserDataResponse {
  email: string;
  userName: string;
  solutionStats: UserSolutionStatsDto;
  taskSolutionsCount: number;
}