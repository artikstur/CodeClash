using Application.Interfaces.Repositories;
using AutoMapper;
using Core;
using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence.Repositories;

public class UsersRepository(WriteDbContext dbContext, IMapper mapper) : IUsersRepository
{
    public async Task Add(string userName, string email, string passwordHash)
    {
        var userEntity = new UserEntity()
        {
            UserName = userName,
            Email = email,
            PasswordHash = passwordHash,
        };

        dbContext.Users.Add(userEntity);
        await dbContext.SaveChangesAsync();
    }

    public async Task<User?> GetByEmail(string email)
    {
        var userEntity = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);
        
        return mapper.Map<User>(userEntity);
    }

    public async Task<List<User>> GetAllUsers()
    {
        var userEntities = await dbContext.Users
            .AsNoTracking()
            .ToListAsync();

        return userEntities
            .Select(mapper.Map<User>)
            .ToList();
    }
}