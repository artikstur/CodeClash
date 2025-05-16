using AutoMapper;
using Core;
using Persistence.Entities;

namespace Persistence;

public class DataBaseMappings: Profile
{
    public DataBaseMappings()
    {
        CreateMap<UserEntity, User>();
    }
}