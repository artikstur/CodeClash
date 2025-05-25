using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Serilog.Context;

namespace Api.MIddlewares;

public class UserDataLoggingMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context, IConfiguration config)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var secretKey = config["Hashing:SecretKey"];
            var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
            
            if (!string.IsNullOrEmpty(email))
            {
                var hashedEmail = HmacHash(email, secretKey);
                using (LogContext.PushProperty("EmailHash", hashedEmail))
                {
                    await next(context);
                    return;
                }
            }
        }

        await next(context);
    }

    private static string HmacHash(string input, string secretKey)
    {
        if (string.IsNullOrEmpty(input) || string.IsNullOrEmpty(secretKey))
            return "***";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}