using Application.Interfaces.Auth;
using Application.Interfaces.Repositories;
using Core;

namespace Application.Services;

public class UsersService(IUsersRepository usersRepository, IPasswordHasher passwordHasher, IJwtProvider jwtProvider) : BaseService
{
    public async Task<string?> Login(string email, string password)
    {
        var user = await usersRepository.GetByEmail(email);

        if (user is null)
        {
            return null;
        }
        
        var passwordIsValid = passwordHasher.Verify(password, user.PasswordHash);

        return !passwordIsValid 
            ? null
            : jwtProvider.Generate(user);
    }
    
    public async Task Register(string userName, string email, string password) 
        => await usersRepository.Add(userName, email, passwordHasher.Generate(password));
    
    public async Task<User> Get(long id) => await usersRepository.Get(id);
}