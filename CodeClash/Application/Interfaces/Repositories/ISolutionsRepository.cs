using Core.Enums;
using Core.Models;

namespace Application.Interfaces.Repositories;

public interface ISolutionsRepository
{
    Task<long> AddNew(long userId, long testCaseId);
    
    Task<Solution> Get(long solutionId);

    Task UpdateStatus(long solutionId, SolutionStatus solutionStatus);
    
    Task<bool> IsAuthor(long userId, long solutionId);
}