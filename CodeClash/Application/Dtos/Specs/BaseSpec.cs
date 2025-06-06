namespace Application.Dtos.Specs;

public abstract class BaseSpec
{
    public int Take { get; set; } = 25;

    public int Page { get; set; } = 1;

    public SortDirection? SortDirection { get; set; }
    
    public string? SortBy { get; set; } 
}