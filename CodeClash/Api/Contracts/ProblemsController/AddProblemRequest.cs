using Core.Enums;

namespace Api.Contracts.ProblemsController;

public record AddProblemRequest(string Name, string Description, ProblemLevel ProblemLevel);