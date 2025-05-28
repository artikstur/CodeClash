using Core.Enums;

namespace Api.Contracts.ProblemsController;

public record UpdateProblemRequest(string? Name, string? Description, ProblemLevel? ProblemLevel);