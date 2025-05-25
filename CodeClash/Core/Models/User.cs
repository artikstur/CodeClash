using Core.Utils;

namespace Core;

public class User: LongIdBase
{
    public string UserName { get; set; }
    
    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public User(long id, string userName, string email, string passwordHash)
    {
        Id = id;
        UserName = userName;
        Email = email;
        PasswordHash = passwordHash;
    }
}