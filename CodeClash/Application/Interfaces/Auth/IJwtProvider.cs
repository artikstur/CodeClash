using Core;

namespace Application.Interfaces.Auth;

public interface IJwtProvider
{
    string Generate(User user);
}