using System.Collections;
using Application.Dtos;
using Application.Interfaces.Repositories;
using Core.Enums;
using Core.Models;
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
        
        if (solutions.Any(x => x.SolutionStatus == SolutionStatus.Failed))
        {
            await taskSolutionRepository.SetStatus(taskSolutionId, SolutionStatus.Failed);
            return SolutionStatus.Failed;
        }
        
        if (solutions.Any(x => x.SolutionStatus == SolutionStatus.InProcess))
        {
            return SolutionStatus.InProcess;
        }
            
        return solutions.All(x => x.SolutionStatus == SolutionStatus.Success)
            ? SolutionStatus.Success
            : status;
    }
    
    public async Task<ICollection<TestCaseWithSolution>> GetSolutions(long taskSolutionId)
    {
        var testCaseWithSolutions = new List<TestCaseWithSolution>();
        
        var solutions = await taskSolutionRepository.GetSolutions(taskSolutionId);
        foreach (var solution in solutions)
        {
            var testCase = await solutionsRepository.GetTestCase(solution.Id);
            var data = new TestCaseWithSolution
            {
                TestCase = testCase,
                Solution = solution
            };
            
            testCaseWithSolutions.Add(data);
        }

        return testCaseWithSolutions;
    }
    
    public async Task<SolutionStatus> CheckSolutionStatus(long solutionId)
    {
        var solution = await solutionsRepository.Get(solutionId);

        return solution.SolutionStatus;
    }
}