namespace Api.Contracts.TestCasesController;

public record UpdateTestCaseRequest(long ProblemId, string? Input, string? Output, bool? IsHidden);