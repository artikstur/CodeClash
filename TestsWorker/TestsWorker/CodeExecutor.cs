using System.Reflection;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using TestsWorker.Dtos;
using TestsWorker.Enums;

namespace TestsWorker;

public static class CodeExecutor
{
    public static async Task<ExecutionResult> ExecuteAsync(string code, long testCaseId, TimeSpan timeout)
    {
        var result = new ExecutionResult
        {
            SolutionId = testCaseId
        };
        try
        {
            var syntaxTree = CSharpSyntaxTree.ParseText(code);

            var assemblyName = Path.GetRandomFileName();
            var references = new[]
            {
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Console).Assembly.Location),
                MetadataReference.CreateFromFile(Assembly.Load("System.Runtime").Location)
            };

            var compilation = CSharpCompilation.Create(
                assemblyName,
                new[] { syntaxTree },
                references,
                new CSharpCompilationOptions(OutputKind.ConsoleApplication));

            using var ms = new MemoryStream();
            var emitResult = compilation.Emit(ms);

            if (!emitResult.Success)
            {
                var errors = new StringBuilder();
                foreach (var diagnostic in emitResult.Diagnostics)
                {
                    if (diagnostic.Severity == DiagnosticSeverity.Error)
                        errors.AppendLine(diagnostic.ToString());
                }

                result.Output = errors.ToString();
                result.TestWorkerStatus = TestWorkerStatus.Error;
                return result;
            }

            ms.Seek(0, SeekOrigin.Begin);
            var assembly = Assembly.Load(ms.ToArray());

            var entryPoint = assembly.EntryPoint;
            if (entryPoint == null)
            {
                result.Output = "Entry point not found.";
                result.TestWorkerStatus = TestWorkerStatus.Error;
                return result;
            }

            var output = new StringWriter();
            Console.SetOut(output);

            var cts = new CancellationTokenSource(timeout);
            var task = Task.Run(() =>
            {
                var parameters = entryPoint.GetParameters().Length == 0 ? null : new object[] { new string[0] };
                entryPoint.Invoke(null, parameters);
            }, cts.Token);

            if (await Task.WhenAny(task, Task.Delay(timeout)) == task)
            {
                result.Output = output.ToString();
                result.TestWorkerStatus = TestWorkerStatus.Ok;
            }
            else
            {
                result.Output = "Execution timed out.";
                result.TestWorkerStatus = TestWorkerStatus.Error;
            }
        }
        catch (Exception ex)
        {
            result.Output = $"Runtime exception: {ex.Message}";
            result.TestWorkerStatus = TestWorkerStatus.Error;
        }

        return result;
    }
}