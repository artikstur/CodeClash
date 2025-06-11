using Core.Enums;
using Core.Utils;

namespace Api.Contracts.ProblemsController;

public class GetProblemResponse: LongIdBase
{
    public string Name { get; set; } = default!;
    
    public string Description { get; set; } = default!;
    
    public ProblemLevel Level { get; set; }  = default!;
};