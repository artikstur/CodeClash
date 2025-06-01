using System.ComponentModel.DataAnnotations;
using Core.Enums;
using Core.Utils;

namespace Persistence.Entities;

public class SolutionEntity: LongIdBase
{
    [MaxLength(255)]
    public string? OutPut { get; set; }
    
    public SolutionStatus SolutionStatus { get; set; }

    public DateTime? TestDate { get; set; }

    public long UserId { get; set; }
    
    public UserEntity User { get; set; }
    
    public long TestCaseId { get; set; }
    
    public TestCaseEntity TestCase { get; set; }
}