using Application.Dtos;
using Application.Dtos.Specs;
using Core.Enums;
using Core.Models;

namespace Application.Interfaces.Repositories;

public interface IProblemsRepository
{
    Task<bool> IsOutputsEquals(long testCaseId, string codeOutPut);
    
    Task Add(long userId, string name, string description, ProblemLevel problemLevel);
    
    Task Update(long id, string? name, string? description, ProblemLevel? problemLevel);

    Task Remove(long problemId);

    Task SetStatus(long problemId, ProblemStatus status);

    Task<Problem> Get(long problemId);
    
    Task<ManyProblemsResponse> GetAll(ProblemsSpec spec, long? userId);
    
    Task<List<long>> GetAllTestIds(long problemId);
    
    Task<bool> IsUserNotValid(long userId, long problemId);
}