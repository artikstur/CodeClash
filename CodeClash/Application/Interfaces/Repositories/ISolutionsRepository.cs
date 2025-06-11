using System.Collections;
using Application.Dtos;
using Core.Enums;
using Core.Models;

namespace Application.Interfaces.Repositories;

public interface ISolutionsRepository
{
    Task<long> AddNew(long userId, long testCaseId, long? taskSolutionId = null);
    
    Task<Solution> Get(long solutionId);
    
    Task<UserSolutionStatsDto> GetUserStatsAsync(long userId);

    Task SetOutput(long solutionId, string? output);

    Task UpdateStatus(long solutionId, SolutionStatus solutionStatus);

    Task<string> GetNeededTestCaseOutput(long solutionId);

    Task<TestCase> GetTestCase(long solutionId);
}