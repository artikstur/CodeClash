using TestsWorker.Enums;

namespace TestsWorker.Dtos;

public class ExecutionResult
{
    public long SolutionId { get; set; }
    
    public string? Output { get; set; }

    public TestWorkerStatus TestWorkerStatus { get; set; }
}