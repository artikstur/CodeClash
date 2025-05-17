using Application.Interfaces.Auth;

namespace Api.Auth;

public class PasswordHasher: IPasswordHasher
{
    public string Generate(string password)
        => BCrypt.Net.BCrypt.EnhancedHashPassword(password);

    public bool Verify(string password, string passwordHash)
        => BCrypt.Net.BCrypt.EnhancedVerify(password, passwordHash);
}