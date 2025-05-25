using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.Configuration;
using Api.Contracts;
using Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UsersService usersService, IOptions<JwtOptions> options, ILogger<UsersController> logger) : BaseController
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserRequest request, 
        [FromServices] IValidator<LoginUserRequest> loginValidator)
    {
        var validationResult = await loginValidator.ValidateAsync(request);
        
        RaiseValidationException(!validationResult.IsValid);

        var token = await usersService.Login(request.Email, request.Password);

        if (token is null)
        {
            return Unauthorized();
        }
        
        Response.Cookies.Append(
            key: options.Value.CustomHeader, 
            value: token,
            options: new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });
        
        logger.LogInformation("Пользователь успешно вошел в систему.");
        return Ok();
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserRequest request, 
        [FromServices] IValidator<RegisterUserRequest> registerValidator)
    {
        var validationResult = await registerValidator.ValidateAsync(request);

        RaiseValidationException(!validationResult.IsValid);

        await usersService.Register(request.UserName, request.Email, request.Password);
        
        logger.LogInformation("Пользователь успешно зарегистрирован.");
        return Ok();
    }
    
    [Authorize]
    [HttpGet("test")]
    public async Task<IActionResult> TestMethod()
    {
        return Ok();
    }
}