using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Repositories;
using Application.Specs;
using AutoMapper;
using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;
using Persistence.Extensions;

namespace Persistence.Repositories;

public class ProblemsRepository(WriteDbContext dbContext, IMapper mapper): IProblemsRepository
{
    public async Task<bool> IsOutputsEquals(long testCaseId, string codeOutPut)
    {
        var testCase = await dbContext.TestCases
            .SingleAsync(x => x.Id == testCaseId);

        return testCase.Output == codeOutPut;
    }

    public async Task Add(long userId, string name, string description, ProblemLevel problemLevel)
    {
        var problemEntity = new ProblemEntity
        {
            Name = name,
            Description = description,
            Status = ProblemStatus.Open,
            Level = problemLevel,
            UserId = userId
        };

        await dbContext.Problems.AddAsync(problemEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task Update(long id, string? name, string? description, ProblemLevel? problemLevel)
    {
        var entity = await dbContext.Problems.SingleAsync(x => x.Id == id);
        
        entity.Name = name ?? entity.Name;
        entity.Description = description ?? entity.Description;
        entity.Level = problemLevel ?? entity.Level;
        
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleAsync(x => x.Id == problemId);
        
        dbContext.Problems.Remove(problemEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task SetStatus(long problemId, ProblemStatus status)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .Include(x => x.TestCases)
            .SingleAsync(x => x.Id == problemId);

        if (status == ProblemStatus.Open && problemEntity.TestCases.Count < 3)
        {
            throw new ValidationException("У задачи должно быть минимум три тест кейса для публикации");
        }
        
        problemEntity.Status = status;
        await dbContext.SaveChangesAsync();
    }

    public async Task<Problem> Get(long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleAsync(x => x.Id == problemId);
        
        return mapper.Map<Problem>(problemEntity);
    }

    public async Task<ICollection<Problem>> GetAll(ProblemsSpec spec)
    {
        var problemEntities = await dbContext.Problems
            .AsNoTracking()
            .Filter(spec)
            .Sort(spec)
            .Where(x => x.Status == ProblemStatus.Open)
            .Page(spec)
            .ToListAsync();

        return mapper.Map<ICollection<Problem>>(problemEntities);
    }
    
    public async Task<ICollection<Problem>> GetUserProblems(ProblemsSpec spec, long userId)
    {
        var problemEntities = await dbContext.Problems
            .AsNoTracking()
            .Filter(spec)
            .Sort(spec)
            .Where(x => x.UserId == userId)
            .Page(spec)
            .ToListAsync();

        return mapper.Map<ICollection<Problem>>(problemEntities);
    }

    public async Task<bool> IsUserNotValid(long userId, long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleAsync(x => x.Id == problemId);

        return problemEntity.UserId != userId;
    }
}