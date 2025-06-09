using Application.Interfaces.Repositories;
using AutoMapper;
using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence.Repositories;

public class TaskSolutionRepository(WriteDbContext dbContext, IMapper mapper): ITaskSolutionRepository
{
    public async Task<long> Create(long userId)
    {
        var newJob = new TaskSolutionEntity
        {
            UserId = userId,
            Status = SolutionStatus.InProcess
        };

        dbContext.TaskSolutions.Add(newJob);
        await dbContext.SaveChangesAsync();

        return newJob.Id;
    }

    public async Task SetStatus(long id, SolutionStatus status)
    {
        var job = await dbContext.TaskSolutions
            .SingleAsync(x => x.Id == id);

        job.Status = status;
        await dbContext.SaveChangesAsync();
    }

    public async Task<SolutionStatus> GetStatus(long id)
    {
        var job = await dbContext.TaskSolutions
            .AsNoTracking()
            .SingleAsync(x => x.Id == id);

        return job.Status;
    }

    public async Task<ICollection<Solution>> GetSolutions(long id)
    {
        var solutions = await dbContext.TaskSolutions
            .Where(x => x.Id == id)
            .SelectMany(x => x.Solutions)
            .ToListAsync();

        return mapper.Map<ICollection<Solution>>(solutions);
    }
}