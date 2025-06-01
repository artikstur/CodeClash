using Core.Enums;

namespace Core.Models;

public class ExecutionResult
{
    public long SolutionId { get; set; }
    
    public string? Output { get; set; }
    
    public TestWorkerStatus TestWorkerStatus { get; set; }
}