using Core.Utils;

namespace Persistence.Entities;

public class TestCaseEntity: LongIdBase
{
    public long ProblemId { get; set; }

    public ProblemEntity Problem { get; set; }
    
    public string Input { get; set; }
    
    public string Output { get; set; }
    
    public bool IsHidden { get; set; }
}