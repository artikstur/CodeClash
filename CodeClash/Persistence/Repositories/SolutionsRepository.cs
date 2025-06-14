using Application.Dtos;
using Application.Interfaces.Repositories;
using AutoMapper;
using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence.Repositories;

public class SolutionsRepository(WriteDbContext dbContext, IMapper mapper): ISolutionsRepository
{
    public async Task<long> AddNew(long userId, long testCaseId, long? taskSolutionId = null)
    {
        var solution = new SolutionEntity
        {
            UserId = userId,
            TestCaseId = testCaseId,
            SolutionStatus = SolutionStatus.InProcess,
            TaskSolutionEntityId = taskSolutionId,
        };

        dbContext.Solutions.Add(solution);

        await dbContext.SaveChangesAsync();

        return solution.Id;
    }

    public async Task<Solution> Get(long solutionId)
    {
        var entity = await dbContext.Solutions
            .AsNoTracking()
            .SingleAsync(x => x.Id == solutionId);

        return mapper.Map<Solution>(entity);
    }
    
    public async Task<UserSolutionStatsDto> GetUserStatsAsync(long userId)
    {
        var solutions = await dbContext.Solutions
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.SolutionStatus != SolutionStatus.InProcess && x.TestDate != null)
            .ToListAsync();

        var stats = new UserSolutionStatsDto
        {
            TotalCount = solutions.Count,
            SuccessCount = solutions.Count(s => s.SolutionStatus == SolutionStatus.Success),
            FailedCount = solutions.Count(s => s.SolutionStatus == SolutionStatus.Failed)
        };

        stats.SuccessRate = stats.TotalCount > 0
            ? Math.Round((double)stats.SuccessCount / stats.TotalCount * 100, 2)
            : 0;

        if (solutions.Count == 0) return stats;
        {
            stats.FirstSubmissionDate = solutions.Min(s => s.TestDate);
            stats.LastSubmissionDate = solutions.Max(s => s.TestDate);

            stats.ActiveDays = solutions
                .Select(s => s.TestDate!.Value.Date)
                .Distinct()
                .Count();

            stats.AttemptsByDate = solutions
                .GroupBy(s => s.TestDate!.Value.Date)
                .ToDictionary(
                    g => g.Key.ToString("yyyy-MM-dd"),
                    g => g.Count()
                );
        }

        return stats;
    }

    public async Task SetOutput(long solutionId, string? output)
    {
        if (output is null)
        {
            return;
        }
        
        var entity = await dbContext.Solutions
            .SingleAsync(x => x.Id == solutionId);

        entity.OutPut = output;
        await dbContext.SaveChangesAsync();
    }

    public async Task<TestCase> GetTestCase(long solutionId)
    {
        var entity = await dbContext.Solutions
            .AsNoTracking()
            .Where(x => x.Id == solutionId)
            .Select(x => x.TestCase)
            .FirstAsync();

        return mapper.Map<TestCase>(entity);
    }
    
    public async Task<string> GetNeededTestCaseOutput(long solutionId)
    {
        var output = await dbContext.Solutions
            .AsNoTracking()
            .Where(x => x.Id == solutionId)
            .Select(x => x.TestCase.Output)
            .SingleAsync();
        
        return output;
    }

    public async Task UpdateStatus(long solutionId, SolutionStatus solutionStatus)
    {
        var entity = await dbContext.Solutions
            .SingleAsync(x => x.Id == solutionId);

        entity.SolutionStatus = solutionStatus;
        entity.TestDate = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
    }

    public async Task<bool> IsAuthor(long userId, long solutionId)
    {
        var entity = await dbContext.Solutions
            .SingleAsync(x => x.Id == solutionId);

        return entity.UserId == userId;
    }
}