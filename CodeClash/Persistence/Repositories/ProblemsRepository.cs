using System.ComponentModel.DataAnnotations;
using Application.Dtos;
using Application.Interfaces.Repositories;
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

    public async Task<Problem> GetRandomProblemByLevel(ProblemLevel problemLevel)
    {
        var randomProblemEntity = await dbContext.Problems
            .AsNoTracking()
            .Where(p => p.Level == problemLevel)
            .OrderBy(x => Guid.NewGuid()) 
            .FirstAsync();

        return mapper.Map<Problem>(randomProblemEntity);
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

    public async Task<int> GetCount(long? userId) =>
        await dbContext.Problems
            .Where(x => !userId.HasValue || x.UserId == userId.Value)
            .CountAsync();

    public async Task<ManyProblemsResponse> GetAll(ProblemsSpec spec, long? userId)
    {
        var query = dbContext.Problems
            .AsNoTracking()
            .Filter(spec)
            .Sort(spec)
            .Where(x => !userId.HasValue || x.UserId == userId)
            .Where(x => x.Status == ProblemStatus.Open);

        var count = await query.CountAsync();
        
        var data = await query 
            .Page(spec)
            .ToListAsync();

        var items = mapper.Map<ICollection<Problem>>(data);

        return new ManyProblemsResponse { Items = items, Count = count};
    }

    public async Task<List<long>> GetAllTestIds(long problemId) =>
       await dbContext.Problems
            .Where(x => x.Id == problemId)
            .SelectMany(x => x.TestCases)
            .Select(x => x.Id)
            .ToListAsync();
    

    public async Task<bool> IsUserNotValid(long userId, long problemId)
    {
        var problemEntity = await dbContext.Problems
            .AsNoTracking()
            .SingleAsync(x => x.Id == problemId);

        return problemEntity.UserId != userId;
    }
}