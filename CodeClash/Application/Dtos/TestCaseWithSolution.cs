using Core.Models;

namespace Application.Dtos;

public class TestCaseWithSolution
{
    public TestCase TestCase { get; set; }
    
    public Solution Solution { get; set; }
}