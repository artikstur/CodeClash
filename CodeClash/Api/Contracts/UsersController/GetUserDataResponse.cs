using Application.Dtos;

namespace Api.Contracts.UsersController;

public record GetUserDataResponse(string Email, string UserName, UserSolutionStatsDto SolutionStats, int TaskSolutionsCount);