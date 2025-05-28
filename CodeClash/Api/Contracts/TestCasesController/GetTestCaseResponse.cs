namespace Api.Contracts.TestCasesController;

public class GetTestCaseResponse
{
    public string Input { get; set; }
    
    public string Output { get; set; }
    
    public bool IsHidden { get; set; }
}