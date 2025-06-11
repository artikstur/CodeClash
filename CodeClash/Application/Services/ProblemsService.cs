using Application.Dtos;
using Application.Interfaces.Repositories;
using Core.Enums;
using Core.Models;

namespace Application.Services;

public class ProblemsService(IProblemsRepository repository, SolutionsService solutionsService, ITaskSolutionRepository taskSolutionRepository): BaseService
{
    public async Task<long> Solve(long problemId, string code, long userId)
    {
        var tests = await repository.GetAllTestIds(problemId);
        var taskSolutionId = await taskSolutionRepository.Create(userId);
        
        foreach (var testId in tests)
        {
            await solutionsService.AddSolutionForTestAsync(userId, testId, code, taskSolutionId);
        }
    
        return taskSolutionId;
    }

    public async Task Add(long userId, string name, string description, ProblemLevel problemLevel) => 
        await repository.Add(userId, name, description, problemLevel);

    public async Task Remove(long userId, long problemId)
    {
        var isAuthor = await repository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        await repository.Remove(problemId);
    }

    public async Task SetStatus(long userId, long problemId, ProblemStatus status)
    {
        var isAuthor = await repository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        await repository.SetStatus(problemId, status);
    }

    public async Task<Problem> Get(long userId, long problemId)
    {
        var problem = await repository.Get(problemId);

        if (problem.Status != ProblemStatus.Hide) return problem;
        var isAuthor = await repository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);

        return problem;
    }

    public async Task<ManyProblemsResponse> GetAll(ProblemsSpec spec, long? userId = null) =>
        await repository.GetAll(spec, userId);
    
    public async Task Update(long userId, long problemId, string? name, string? description, ProblemLevel? problemLevel)
    {
        var isAuthor = await repository.IsUserNotValid(userId, problemId);
        RaiseValidationException(isAuthor);
        
        await repository.Update(problemId, name, description, problemLevel);
    }
}