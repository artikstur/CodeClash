using Core.Enums;
using Core.Models;

namespace Application.Interfaces.Repositories;

public interface ITaskSolutionRepository
{
    Task<long> Create(long userId);

    Task<int> GetUserSolutionsCount(long userId);

    Task SetStatus(long id, SolutionStatus status);
    
    Task<SolutionStatus> GetStatus(long id);
    
    Task<ICollection<Solution>> GetSolutions(long id);
}