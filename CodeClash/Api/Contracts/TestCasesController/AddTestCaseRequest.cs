namespace Api.Contracts.TestCasesController;

public record AddTestCaseRequest(long ProblemId, string Input, string Output, bool IsHidden);