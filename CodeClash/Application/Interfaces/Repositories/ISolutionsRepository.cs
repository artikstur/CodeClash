using Core.Enums;
using Core.Models;

namespace Application.Interfaces.Repositories;

public interface ISolutionsRepository
{
    Task<long> AddNew(long userId, long testCaseId, long? taskSolutionId = null);
    
    Task<Solution> Get(long solutionId);

    Task SetOutput(long solutionId, string? output);

    Task UpdateStatus(long solutionId, SolutionStatus solutionStatus);
    
    Task<bool> IsAuthor(long userId, long solutionId);

    Task<string> GetNeededTestCaseOutput(long solutionId);

    Task<TestCase> GetTestCase(long solutionId);
}