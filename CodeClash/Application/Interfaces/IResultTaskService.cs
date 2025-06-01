using Core.Models;

namespace Application.Interfaces;

public interface IResultTaskService
{
    Task UpdateTaskStatusAsync(ExecutionResult result);
}