using AutoMapper;
using Core;
using Core.Models;
using Persistence.Entities;

namespace Persistence;

public class DataBaseMappings: Profile
{
    public DataBaseMappings()
    {
        CreateMap<UserEntity, User>();
        CreateMap<ProblemEntity, Problem>();
        CreateMap<TestCaseEntity, TestCase>();
    }
}