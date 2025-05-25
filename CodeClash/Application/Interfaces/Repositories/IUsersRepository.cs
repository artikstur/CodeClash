using Core;

namespace Application.Interfaces.Repositories;

public interface IUsersRepository
{
    Task Add(string userName, string email, string passwordHash);
    
    Task<User?> GetByEmail(string email);
    
    Task<List<User>> GetAllUsers();
    
    Task<User> Get(long id);
}