using Core.Models;

namespace Application.Interfaces.Repositories;

public interface ITestCasesRepository
{
    Task Add(long problemId, string input, string output, bool isHidden);

    Task Remove(long testCaseId);

    Task<TestCase> Get(long testCaseId);

    Task Update(long testCaseId, string? input, string? output, bool? isHidden);

    Task<ICollection<TestCase>> GetByProblemId(long problemId);
}