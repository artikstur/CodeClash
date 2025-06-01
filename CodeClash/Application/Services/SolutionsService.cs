using Application.Interfaces.Repositories;

namespace Application.Services;

public class SolutionsService(ISolutionsRepository solutionsRepository)
{
    public async Task AddSolutionForTestAsync(long userId, long testCaseId) =>
        await solutionsRepository.AddNew(userId, testCaseId);
}