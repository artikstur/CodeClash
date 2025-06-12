using Application.Dtos;
using Application.Interfaces.Repositories;
using Application.Services;
using Core.Enums;
using Core.Models;
using Infrastructure.RabbitMq.Contacts;
using Moq;

namespace Tests;

public class ProblemsServiceTests
{
    [Fact]
    public async Task Get_HiddenProblem_ReturnsIfUserIsAuthor()
    {
        // Arrange
        var problemId = 1L;
        var userId = 1L;
        var problem = new Problem { Id = problemId, Status = ProblemStatus.Hide };

        var repoMock = new Mock<IProblemsRepository>();
        repoMock.Setup(r => r.Get(problemId)).ReturnsAsync(problem);
        repoMock.Setup(r => r.IsUserNotValid(userId, problemId)).ReturnsAsync(false);

        var solutionRepoMock = new Mock<ITaskSolutionRepository>();
        var solutionsServiceMock = new Mock<SolutionsService>(null!, null!, null!, solutionRepoMock.Object);

        var service = new ProblemsService(repoMock.Object, solutionsServiceMock.Object, solutionRepoMock.Object);

        // Act
        var result = await service.Get(userId, problemId);

        // Assert
        Assert.Equal(problem, result);
    }
    
    [Fact]
    public async Task AddSolutionForTestAsync_SendsMessageAndReturnsSolutionId()
    {
        var userId = 1L;
        var testCaseId = 10L;
        var taskSolutionId = 100L;
        var expectedSolutionId = 555L;
        var code = "print('hi')";

        var testCase = new TestCase { Id = testCaseId, Input = "input_data" };

        var solutionsRepoMock = new Mock<ISolutionsRepository>();
        var rabbitMock = new Mock<IRabbitMqSender>();
        var testCaseRepoMock = new Mock<ITestCasesRepository>();
        var taskSolutionRepoMock = new Mock<ITaskSolutionRepository>();

        solutionsRepoMock.Setup(x => x.AddNew(userId, testCaseId, taskSolutionId))
            .ReturnsAsync(expectedSolutionId);
        testCaseRepoMock.Setup(x => x.Get(testCaseId))
            .ReturnsAsync(testCase);

        var service = new SolutionsService(solutionsRepoMock.Object, rabbitMock.Object, testCaseRepoMock.Object, taskSolutionRepoMock.Object);

        // Act
        var result = await service.AddSolutionForTestAsync(userId, testCaseId, code, taskSolutionId);

        // Assert
        Assert.Equal(expectedSolutionId, result);
        rabbitMock.Verify(x => x.SendMessage(It.Is<TestCodeDto>(dto =>
            dto.SolutionId == expectedSolutionId &&
            dto.Code == code &&
            dto.Input == testCase.Input
        ), It.IsAny<string>()), Times.Once);
    }

}