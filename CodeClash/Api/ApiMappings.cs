using Api.Contracts.ProblemsController;
using Api.Contracts.TestCasesController;
using AutoMapper;
using Core.Models;

namespace Api;

public class ApiMappings: Profile
{
    public ApiMappings()
    {
        CreateMap<Problem, GetProblemResponse>();
        CreateMap<TestCase, GetTestCaseResponse>();
    }
}