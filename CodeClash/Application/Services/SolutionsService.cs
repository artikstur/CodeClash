using Application.Dtos;
using Application.Interfaces.Repositories;
using Core.Enums;
using Infrastructure.RabbitMq.Contacts;

namespace Application.Services;

public class SolutionsService(ISolutionsRepository solutionsRepository, IRabbitMqSender rabbitMqSender, ITestCasesRepository testCasesRepository)
{
    public async Task<long> AddSolutionForTestAsync(long userId, long testCaseId, string code)
    {
        var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";
        
        var solutionId = await solutionsRepository.AddNew(userId, testCaseId);
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
    
    
    public async Task<SolutionStatus> CheckSolutionStatus(long solutionId)
    {
        var solution = await solutionsRepository.Get(solutionId);

        return solution.SolutionStatus;
    }
}