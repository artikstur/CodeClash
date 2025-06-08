using Application.Dtos;
using Application.Interfaces.Repositories;
using Core.Enums;
using Infrastructure.RabbitMq.Contacts;

namespace Application.Services;

public class SolutionsService(ISolutionsRepository solutionsRepository, IRabbitMqSender rabbitMqSender)
{
    public async Task<long> AddSolutionForTestAsync(long userId, long testCaseId, string code)
    {
        var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";
        
        var solutionId = await solutionsRepository.AddNew(userId, testCaseId);
        var data = new TestCodeDto
        {
            SolutionId = solutionId,
            Code = code
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