using System.Text.Json;
using Application.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ResultTaskService(ILogger<ResultTaskService> logger): IResultTaskService
{
    public Task UpdateTaskStatusAsync(ExecutionResult result)
    {
        logger.LogInformation(JsonSerializer.Serialize(result));
        Console.WriteLine(JsonSerializer.Serialize(result));
        
        return Task.CompletedTask;
    }
}