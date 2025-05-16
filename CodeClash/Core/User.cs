using Core.Utils;

namespace Core;

public class User: LongIdBase
{
    public string UserName { get; set; }
    
    public string Email { get; set; }

    public string PasswordHash { get; set; }
}