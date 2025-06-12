using Application.Interfaces.Repositories;
using Core.Models;

namespace Application.Services;

public class TestCasesService(ITestCasesRepository testCasesRepository, IProblemsRepository problemsRepository): BaseService
{
    public async Task Add(long problemId, string input, string output, bool isHidden) =>
        await testCasesRepository.Add(problemId, input, output, isHidden);
    
    public async Task Remove(long userId, long problemId, long testCaseId)
    {
        var isAuthor = await problemsRepository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        await testCasesRepository.Remove(testCaseId);
    }

    public async Task<TestCase> Get(long userId, long problemId, long testCaseId)
    {
        var isAuthor = await problemsRepository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        return await testCasesRepository.Get(testCaseId);
    }

    public async Task Update(long userId, long problemId, long testCaseId, string? input, string? output, bool? isHidden)
    {
        var isAuthor = await problemsRepository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        await testCasesRepository.Update(testCaseId, input, output, isHidden);
    }

    public async Task<ICollection<TestCase>> GetByProblemId(long userId, long problemId)
    {
        // var isAuthor = await problemsRepository.IsUserNotValid(userId, problemId);
        // RaiseValidationException(isAuthor);
        
        return await testCasesRepository.GetByProblemId(problemId);
    }
}