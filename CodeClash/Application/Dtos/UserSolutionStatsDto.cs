namespace Application.Dtos;

public class UserSolutionStatsDto
{
    public int TotalCount { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public double SuccessRate { get; set; }

    public DateTime? FirstSubmissionDate { get; set; }
    public DateTime? LastSubmissionDate { get; set; }
    public int ActiveDays { get; set; }

    public Dictionary<string, int> AttemptsByDate { get; set; } = new();
}