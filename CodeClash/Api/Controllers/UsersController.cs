using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.Configuration;
using Api.Contracts;
using Api.Contracts.UsersController;
using Api.Filters;
using Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UsersService usersService, IOptions<JwtOptions> options, 
    ILogger<UsersController> logger, SolutionsService solutionsService) : BaseController
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
                Secure = false,
                SameSite = SameSiteMode.Lax
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
    
    [HttpGet("stats")]
    [UserIdFilter]
    public async Task<IActionResult> GetUserData()
    {
        var userId = (long)HttpContext.Items["userId"]!;
        
        logger.LogInformation($"Получаем информацию по пользователю с айди {userId}");

        var user = await usersService.Get(userId);
        var testCaseSolutionsStats = await solutionsService.GetUserTestCaseSolutionStats(userId);
        var taskSolutionsCount = await solutionsService.GetUserSolutionsCount(userId);

        var response = new GetUserDataResponse(user.Email, user.UserName, testCaseSolutionsStats, taskSolutionsCount);
        
        return Ok(response);
    }
}