using Application.Interfaces.Repositories;
using Application.Specs;
using Core.Enums;
using Core.Models;

namespace Application.Services;

public class ProblemsService(IProblemsRepository repository)
{
    public async Task Add(string name, string description,ProblemLevel problemLevel) =>
        await repository.Add(name, description, problemLevel);

    public async Task Remove(long problemId) =>
        await repository.Remove(problemId);
    
    public async Task SetStatus(long problemId, ProblemStatus status) =>
        await repository.SetStatus(problemId, status);
    
    public async Task<Problem> Get(long problemId) =>
        await repository.Get(problemId);
    
    public async Task<ICollection<Problem>> GetAll(ProblemsSpec spec) =>
        await repository.GetAll(spec);
}