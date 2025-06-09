using Api.Contracts.ProblemsController;
using Api.Filters;
using Application.Dtos.Specs;
using Application.Services;
using AutoMapper;
using Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Entities;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProblemsController(ProblemsService problemsService, IMapper mapper, 
    ILogger<ProblemsController> logger, SolutionsService solutionsService) : BaseController
{
    [HttpPost]
    [UserIdFilter]
    public async Task<IActionResult> Add([FromBody] AddProblemRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} пытается добавить новую задачу с именем: {request.Name}");

        await problemsService.Add(userId, request.Name, request.Description, request.ProblemLevel);
        logger.LogInformation($"Пользователь {userId} успешно добавил новую задачу: {request.Name}");
        
        return Ok();
    }

    [HttpGet("{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> Get(long problemId)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} запрашивает информацию о задаче с ID: {problemId}");

        var problem = await problemsService.Get(userId, problemId);
        logger.LogInformation($"Информация о задаче с ID: {problemId} успешно получена пользователем {userId}");
        
        return Ok(mapper.Map<GetProblemResponse>(problem));
    }
    
    [HttpPost("Solve/{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> SolveProblem(long problemId, [FromBody] SolveRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        var solutionId = await problemsService.Solve(problemId, request.Code, userId);
        
        return Ok(new {solutionId});
    }
    
    [HttpGet("SolutionStatus/{solutionId:long}")]
    public async Task<IActionResult> CheckSolutionStatus(long solutionId)
    {
        var status = await solutionsService.GetSolutionStatus(solutionId);

        return Ok(new {status});
    }


    [HttpPut("{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> Update(long problemId, [FromBody] UpdateProblemRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} пытается обновить задачу с ID: {problemId}");

        await problemsService.Update(userId, problemId, request.Name, request.Description, request.ProblemLevel);
        logger.LogInformation($"Пользователь {userId} успешно обновил задачу с ID: {problemId}");
        
        return Ok();
    }

    [HttpDelete("{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> Remove(long problemId)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} пытается удалить задачу с ID: {problemId}");

        await problemsService.Remove(userId, problemId);
        logger.LogInformation($"Пользователь {userId} успешно удалил задачу с ID: {problemId}");
        
        return Ok();
    }

    [HttpPost("{problemId:long}/SetStatus")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> SetStatus(long problemId, [FromQuery] ProblemStatus problemStatus)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} пытается изменить статус задачи {problemId} на {problemStatus}");

        await problemsService.SetStatus(userId, problemId, problemStatus);
        logger.LogInformation($"Пользователь {userId} успешно изменил статус задачи {problemId} на {problemStatus}");
        
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] ProblemsSpec spec)
    {
        logger.LogInformation($"Запрос на получение списка задач");
        
        var response = await problemsService.GetAll(spec);
        logger.LogInformation($"Успешно получено {response.Count} задач");
        
        return Ok(response);
    }
    
    [HttpGet("User")]
    [UserIdFilter]
    public async Task<IActionResult> GetManyByUser([FromQuery] ProblemsSpec spec)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Запрос на получение списка задач");
        
        var response = await problemsService.GetAll(spec, userId);
        logger.LogInformation($"Успешно получено {response.Count} задач");
        
        return Ok(response);
    }
}