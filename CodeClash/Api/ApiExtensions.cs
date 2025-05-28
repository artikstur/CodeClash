using System.Security.Claims;
using System.Text;
using Api.Configuration;
using Api.Contracts;
using Api.Validation.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Persistence;

namespace Api;

public static class ApiExtensions
{
    public static void AddApiAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtOptions = configuration.GetSection(nameof(JwtOptions)).Get<JwtOptions>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions!.SecretKey))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        context.Token = context.Request.Cookies[jwtOptions.CustomHeader];

                        return Task.CompletedTask;
                    }
                };
            });
    }
    
    public static void AddValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<LoginUserRequest>, LoginUserRequestValidator>();
        services.AddScoped<IValidator<RegisterUserRequest>, RegisterUserRequestValidator>();
    }

    public static void AddAutoMapper(this IServiceCollection services)
    {
        services.AddAutoMapper(x => {
            x.AddProfile<DataBaseMappings>();
            x.AddProfile<ApiMappings>();
        });
    }

    public static bool TryGetId(this HttpContext context, out long id)
    {
        id = default;
        
        var hasRouteId = context.GetRouteData()?.Values.TryGetValue("id", out var routeIdObj) == true &&
                         long.TryParse(routeIdObj?.ToString(), out id);
        
        var hasQueryId = !hasRouteId &&
                         context.Request.Query.TryGetValue("id", out var queryIdVal) &&
                         long.TryParse(queryIdVal.ToString(), out id);

        return hasRouteId || hasQueryId;
    }
    
    public static long? GetCurrentUserId(HttpContext context)
    {
        var idString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? context.User.FindFirst("sub")?.Value;

        if (long.TryParse(idString, out var id))
        {
            return id;
        }

        return null;
    }

    public static string? GetCurrentUserEmail(HttpContext context)
    {
        return context.User.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static bool IsAuthenticated(HttpContext context)
    {
        return context.User.Identity?.IsAuthenticated == true;
    }
}