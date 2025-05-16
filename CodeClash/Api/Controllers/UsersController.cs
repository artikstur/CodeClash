using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UsersService usersService) : ControllerBase
{
    private readonly UsersService _usersService = usersService;
}