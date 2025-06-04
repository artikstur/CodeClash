using Core.Enums;

namespace Application.Specs;

public class ProblemsSpec: BaseSpec
{
    public string? Name { get; set; }
    
    public ProblemLevel? Level { get; set; }
}