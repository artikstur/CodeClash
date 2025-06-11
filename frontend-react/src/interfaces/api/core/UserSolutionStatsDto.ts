export default interface UserSolutionStatsDto {
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  firstSubmissionDate: string | null;
  lastSubmissionDate: string | null;
  activeDays: number;
  attemptsByDate: Record<string, number>;
}