using Core.Enums;
using Core.Utils;

namespace Persistence.Entities;

public class TaskSolutionEntity: LongIdBase
{
    public SolutionStatus Status { get; set; }

    public long UserId { get; set; }
    
    public UserEntity User { get; set; }

    public ICollection<SolutionEntity> Solutions { get; set; }
}