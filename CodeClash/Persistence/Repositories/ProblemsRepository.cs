using Application.Interfaces.Repositories;
using Application.Specs;
using AutoMapper;
using Core;
using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;
using Persistence.Extensions;

namespace Persistence.Repositories;

public class ProblemsRepository(WriteDbContext dbContext, IMapper mapper): IProblemsRepository
{
    public async Task Add(string name, string description, ProblemLevel problemLevel)
    {
        var problemEntity = new ProblemEntity
        {
            Name = name,
            Description = description,
            Status = ProblemStatus.Hide,
            Level = problemLevel,
        };

        await dbContext.Problems.AddAsync(problemEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == problemId);
        
        dbContext.Problems.Remove(problemEntity!);
        await dbContext.SaveChangesAsync();
    }

    public async Task SetStatus(long problemId, ProblemStatus status)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == problemId);

        problemEntity!.Status = status;
        await dbContext.SaveChangesAsync();
    }

    public async Task<Problem> Get(long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == problemId);
        
        return mapper.Map<Problem>(problemEntity);
    }

    public async Task<ICollection<Problem>> GetAll(ProblemsSpec spec)
    {
        var problemEntities = await dbContext.Problems
            .AsNoTracking()
            .Filter(spec)
            .Sort(spec)
            .Page(spec)
            .ToListAsync();

        return mapper.Map<ICollection<Problem>>(problemEntities);
    }
}