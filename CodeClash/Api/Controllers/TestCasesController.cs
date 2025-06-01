using Api.Contracts.ProblemsController;
using Api.Contracts.TestCasesController;
using Api.Filters;
using Application.Interfaces.Repositories;
using Application.Services;
using AutoMapper;
using Infrastructure.RabbitMq.Contacts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Entities;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TestCasesController(TestCasesService testCasesService, IMapper mapper, ILogger<TestCasesController> logger,
    IRabbitMqSender rabbitMqSender, SolutionsService solutionsService) : BaseController
{
    [HttpPost("${testId:long}/AddNewForOneTask")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(TestCaseEntity), "testId")]
    public async Task<IActionResult> Solve(long testId, [FromBody] SolveRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";

        await solutionsService.AddSolutionForTestAsync(userId, testId);
        await rabbitMqSender.SendMessage(request.Code, queueName);
        logger.LogInformation($"Успешно добавлено новое решение в БД для {testId}");
        
        return Ok();
    }
    
    [HttpPost]
    [UserIdFilter]
    public async Task<IActionResult> Add([FromBody] AddTestCaseRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} добавляет новый тест-кейс для задачи {request.ProblemId}. Скрытый: {request.IsHidden}");

        await testCasesService.Add(request.ProblemId, request.Input, request.Output, request.IsHidden);
        logger.LogInformation($"Пользователь {userId} успешно добавил тест-кейс для задачи {request.ProblemId}");
        
        return Ok();
    }

    [HttpGet("${testId:long}/{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    [EntityExistenceFilter(typeof(TestCaseEntity), "testId")]
    public async Task<IActionResult> Get(long testId, long problemId)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} запрашивает тест-кейс {testId} для задачи {problemId}");

        var testCase = await testCasesService.Get(userId, problemId, testId);
        logger.LogInformation($"Тест-кейс {testId} для задачи {problemId} успешно получен пользователем {userId}");
        
        return Ok(mapper.Map<GetTestCaseResponse>(testCase));
    }
    
    [HttpGet("${problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    public async Task<IActionResult> GetByProblem(long problemId)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} запрашивает все тест-кейсы для задачи {problemId}");

        var testCases = await testCasesService.GetByProblemId(userId, problemId);
        logger.LogInformation($"Получено {testCases.Count} тест-кейсов для задачи {problemId} пользователем {userId}");
        
        return Ok(testCases);
    }

    [HttpPut("{testId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(TestCaseEntity), "testId")]
    public async Task<IActionResult> Update(long testId, [FromBody] UpdateTestCaseRequest request)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} обновляет тест-кейс {testId} для задачи {request.ProblemId}");

        await testCasesService.Update(userId, request.ProblemId, testId, request.Input, request.Output, request.IsHidden);
        logger.LogInformation($"Тест-кейс {testId} для задачи {request.ProblemId} успешно обновлен пользователем {userId}");
        
        return Ok();
    }
    
    [HttpDelete("${testId:long}/{problemId:long}")]
    [UserIdFilter]
    [EntityExistenceFilter(typeof(ProblemEntity), "problemId")]
    [EntityExistenceFilter(typeof(TestCaseEntity), "testId")]
    public async Task<IActionResult> Remove(long testId, long problemId)
    {
        var userId = (long)HttpContext.Items["userId"]!;
        logger.LogInformation($"Пользователь {userId} удаляет тест-кейс {testId} для задачи {problemId}");

        await testCasesService.Remove(userId, problemId, testId);
        logger.LogInformation($"Тест-кейс {testId} для задачи {problemId} успешно удален пользователем {userId}");
        
        return Ok();
    }
}