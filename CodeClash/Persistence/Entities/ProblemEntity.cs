using Core.Enums;
using Core.Utils;

namespace Persistence.Entities;

public class ProblemEntity: LongIdBase
{
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public ProblemStatus Status { get; set; }
    
    public ProblemLevel Level { get; set; }

    public ICollection<TestCaseEntity> TestCases { get; set; }
}