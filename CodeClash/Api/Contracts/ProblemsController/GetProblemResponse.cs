using Core.Enums;
using Core.Utils;

namespace Api.Contracts.ProblemsController;

public class GetProblemResponse: LongIdBase
{
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public ProblemLevel Level { get; set; }
};