using Application.Dtos;
using Application.Interfaces.Repositories;
using Core.Enums;
using Infrastructure.RabbitMq.Contacts;

namespace Application.Services;

public class SolutionsService(ISolutionsRepository solutionsRepository, IRabbitMqSender rabbitMqSender, 
    ITestCasesRepository testCasesRepository, ITaskSolutionRepository taskSolutionRepository)
{
    public async Task<long> AddSolutionForTestAsync(long userId, long testCaseId, string code, long? taskSolutionId = null)
    {
        var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";
        
        var solutionId = await solutionsRepository.AddNew(userId, testCaseId, taskSolutionId);
        var testCase = await testCasesRepository.Get(testCaseId);
        var data = new TestCodeDto
        {
            SolutionId = solutionId,
            Code = code,
            Input = testCase.Input
        };
        
        await rabbitMqSender.SendMessage(data, queueName);

        return solutionId;
    }
    
    public async Task<SolutionStatus> GetSolutionStatus(long taskSolutionId)
    {
        var status = await taskSolutionRepository.GetStatus(taskSolutionId);
        if (status is not SolutionStatus.InProcess) return status;
        var solutions = await taskSolutionRepository.GetSolutions(taskSolutionId);

        if (solutions.Any(x => x.SolutionStatus == SolutionStatus.InProcess))
        {
            return SolutionStatus.InProcess;
        }

        if (solutions.Any(x => x.SolutionStatus == SolutionStatus.Failed))
        {
            await taskSolutionRepository.SetStatus(taskSolutionId, SolutionStatus.Failed);
            return SolutionStatus.Failed;
        }
            
        return solutions.All(x => x.SolutionStatus == SolutionStatus.Success)
            ? SolutionStatus.Success
            : status;
    }
    
    public async Task<SolutionStatus> CheckSolutionStatus(long solutionId)
    {
        var solution = await solutionsRepository.Get(solutionId);

        return solution.SolutionStatus;
    }
}