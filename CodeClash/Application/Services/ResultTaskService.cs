using System.Text.Json;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Core.Enums;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ResultTaskService(ILogger<ResultTaskService> logger, ISolutionsRepository solutionsRepository): IResultTaskService
{
    public async Task UpdateTaskStatusAsync(ExecutionResult result)
    {
        logger.LogInformation("Задача отработала на одной из реплик. Происходит обработка результатов");
        
        switch (result.TestWorkerStatus)
        {
            case TestWorkerStatus.Ok:
                var neededOutPut = await solutionsRepository.GetNeededTestCaseOutput(result.SolutionId);
                if (string.Equals(neededOutPut.Trim(), result.Output?.Trim(), StringComparison.Ordinal))
                {
                    await solutionsRepository.UpdateStatus(result.SolutionId, SolutionStatus.Success);
                }
                else
                {
                    await solutionsRepository.UpdateStatus(result.SolutionId, SolutionStatus.Failed);
                }

                break;
            case TestWorkerStatus.Error:
                await solutionsRepository.UpdateStatus(result.SolutionId, SolutionStatus.Failed);

                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        await solutionsRepository.SetOutput(
            result.SolutionId, 
            result.Output?.Trim()?.Length > 10 
                ? result.Output.Trim().Substring(0, 80) + "..."
                : result.Output?.Trim()
        );

        logger.LogInformation("Статус задачи успешно изменен");
    }
}