using Core.Enums;
using Core.Utils;

namespace Core.Models;

public class Solution: LongIdBase
{
    public string? OutPut { get; set; }
    
    public SolutionStatus SolutionStatus { get; set; }

    public DateTime? TestDate { get; set; }
}