using Application.Interfaces.Repositories;
using AutoMapper;
using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence.Repositories;

public class SolutionsRepository(WriteDbContext dbContext, IMapper mapper): ISolutionsRepository
{
    public async Task<long> AddNew(long userId, long testCaseId)
    {
        var solution = new SolutionEntity
        {
            UserId = userId,
            TestCaseId = testCaseId,
            SolutionStatus = SolutionStatus.InProcess,
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