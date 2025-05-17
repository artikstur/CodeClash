using Api.Contracts;
using Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UsersService usersService) : BaseController
{
    private readonly UsersService _usersService = usersService;

    [HttpGet("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserRequest request, 
        [FromServices] IValidator<LoginUserRequest> loginValidator)
    {
        var validationResult = await loginValidator.ValidateAsync(request);
        
        RaiseValidationException(!validationResult.IsValid);

        return Ok();
    }
    
    [HttpGet("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserRequest request, 
        [FromServices] IValidator<RegisterUserRequest> registerValidator)
    {
        var validationResult = await registerValidator.ValidateAsync(request);

        RaiseValidationException(!validationResult.IsValid);
        
        return Ok();
    }
    
    // [Authorize]
    [HttpGet("test")]
    public async Task<IActionResult> TestMethod()
    {
        RaiseValidationException(true);
        return Ok();
    }
}