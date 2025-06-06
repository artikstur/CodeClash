using Core.Models;

namespace Application.Dtos;

public class ManyProblemsResponse
{
    public ICollection<Problem> Items { get; set; } = [];
    
    public int Count { get; set; }
}