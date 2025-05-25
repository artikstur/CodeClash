using Core.Enums;
using Core.Utils;

namespace Core.Models;

public class Problem: LongIdBase
{
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public ProblemStatus Status { get; set; }
    
    public ProblemLevel Level { get; set; }
}