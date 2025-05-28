using Application.Interfaces.Repositories;
using AutoMapper;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence.Repositories;

public class TestCasesRepository(WriteDbContext dbContext, IMapper mapper): ITestCasesRepository
{
    public async Task Add(long problemId, string input, string output, bool isHidden)
    {
        var testCaseEntity = new TestCaseEntity
        {
            ProblemId = problemId,
            Input = input,
            Output = output,
            IsHidden = isHidden,
        };

        dbContext.TestCases.Add(testCaseEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(long testCaseId)
    {
        var testCaseEntity = await dbContext.TestCases
            .SingleAsync(x => x.Id == testCaseId);

        dbContext.TestCases.Remove(testCaseEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task<TestCase> Get(long testCaseId)
    {
        var testCaseEntity = await dbContext.TestCases
            .AsNoTracking()
            .SingleAsync(x => x.Id == testCaseId);

        return mapper.Map<TestCase>(testCaseEntity);
    }

    public async Task Update(long testCaseId, string? input, string? output, bool? isHidden)
    {
        var testCaseEntity = await dbContext.TestCases
            .AsNoTracking()
            .SingleAsync(x => x.Id == testCaseId);
        
        testCaseEntity.Input = input ?? testCaseEntity.Input;
        testCaseEntity.Output = output ?? testCaseEntity.Output;
        testCaseEntity.IsHidden = isHidden ?? testCaseEntity.IsHidden;
        
        await dbContext.SaveChangesAsync();
    }

    public async Task<ICollection<TestCase>> GetByProblemId(long problemId)
    {
        var testCases = await dbContext.Problems
            .AsNoTracking()
            .Where(x => x.Id == problemId)
            .SelectMany(x => x.TestCases)
            .ToListAsync();
        
        return mapper.Map<ICollection<TestCase>>(testCases);
    }
}