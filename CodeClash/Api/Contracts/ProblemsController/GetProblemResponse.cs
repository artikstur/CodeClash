using Core.Enums;

namespace Api.Contracts.ProblemsController;

public class GetProblemResponse
{
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public ProblemLevel Level { get; set; }
};