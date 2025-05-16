using Core.Utils;

namespace Persistence.Entities;

public class UserEntity: LongIdBase
{
    public string UserName { get; set; }
    
    public string Email { get; set; }

    public string PasswordHash { get; set; }
}