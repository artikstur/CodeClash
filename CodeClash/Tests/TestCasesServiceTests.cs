using Application.Interfaces.Repositories;
using Application.Services;
using Core.Models;
using Moq;

namespace Tests;

public class TestCasesServiceTests
{
    [Fact]
    public async Task Add_CallsRepositoryWithCorrectParameters()
    {
        // Arrange
        var testCasesRepoMock = new Mock<ITestCasesRepository>();
        var problemsRepoMock = new Mock<IProblemsRepository>();

        var service = new TestCasesService(testCasesRepoMock.Object, problemsRepoMock.Object);

        var problemId = 1L;
        var input = "1 2";
        var output = "3";
        var isHidden = true;

        // Act
        await service.Add(problemId, input, output, isHidden);

        // Assert
        testCasesRepoMock.Verify(x => x.Add(problemId, input, output, isHidden), Times.Once);
    }
    
    [Fact]
    public async Task Remove_ValidUser_CallsRepositoryRemove()
    {
        // Arrange
        var testCasesRepoMock = new Mock<ITestCasesRepository>();
        var problemsRepoMock = new Mock<IProblemsRepository>();

        var userId = 1L;
        var problemId = 2L;
        var testCaseId = 3L;

        problemsRepoMock.Setup(r => r.IsUserNotValid(userId, problemId)).ReturnsAsync(false);

        var service = new TestCasesService(testCasesRepoMock.Object, problemsRepoMock.Object);

        // Act
        await service.Remove(userId, problemId, testCaseId);

        // Assert
        testCasesRepoMock.Verify(x => x.Remove(testCaseId), Times.Once);
    }
    
    [Fact]
    public async Task Get_ValidUser_ReturnsTestCase()
    {
        // Arrange
        var testCasesRepoMock = new Mock<ITestCasesRepository>();
        var problemsRepoMock = new Mock<IProblemsRepository>();

        var userId = 1L;
        var problemId = 2L;
        var testCaseId = 3L;

        var expectedTestCase = new TestCase { Id = testCaseId };

        problemsRepoMock.Setup(r => r.IsUserNotValid(userId, problemId)).ReturnsAsync(false);
        testCasesRepoMock.Setup(r => r.Get(testCaseId)).ReturnsAsync(expectedTestCase);

        var service = new TestCasesService(testCasesRepoMock.Object, problemsRepoMock.Object);

        // Act
        var result = await service.Get(userId, problemId, testCaseId);

        // Assert
        Assert.Equal(expectedTestCase, result);
    }

}