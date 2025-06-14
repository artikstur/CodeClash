﻿using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Serilog;
using TestsWorker.Dtos;

namespace TestsWorker;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var seqUrl = Environment.GetEnvironmentVariable("SEQ_URL") ?? "http://localhost:5341";
        
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.Seq(seqUrl)
            .Enrich.FromLogContext()
            .CreateLogger();

        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddSerilog(); 
        });

        var logger = loggerFactory.CreateLogger("Worker");
        
        try
        {
            var guid = Guid.NewGuid();
            var hostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
            var listenQueueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";
            var senderQueueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE_RESULTS") ?? "results_queue";
            
            var factory = new ConnectionFactory
            {
                HostName = hostName,
                Port = 5672,
                UserName = "guest",
                Password = "guest"
            };

            await using var connection = await factory.CreateConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();
            await channel.BasicQosAsync(0, 5, false);

            await channel.QueueDeclareAsync(queue: listenQueueName,
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (model, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    var dto = JsonSerializer.Deserialize<TestCodeDto>(message);
                    
                    logger.LogInformation("{Guid}: Получено сообщение", guid);
                    
                    var executedTestResult = await CodeExecutor.ExecuteAsync(dto.Code,
                        dto.SolutionId,TimeSpan.FromSeconds(5), dto.Input);
                    
                    var sendMessageDto = new SendMessageDto
                    {   
                        Message = executedTestResult,
                        QueueName = senderQueueName,
                        Channel = channel,
                    };

                    await Sender.SendMessage(sendMessageDto);
                    logger.LogInformation("{Guid}: Отправлено сообщение", guid);
                    await channel.BasicAckAsync(ea.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "{Guid}: Ошибка при обработке сообщения", guid);
                    await channel.BasicNackAsync(ea.DeliveryTag, false, requeue: true);
                }
            };

            await channel.BasicConsumeAsync(queue: listenQueueName, autoAck: false, consumer: consumer);

            logger.LogInformation("Worker запущен. Ожидание сообщений...");
            await Task.Delay(Timeout.Infinite);
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Приложение завершилось с фатальной ошибкой");
        }
        finally
        {
            await Log.CloseAndFlushAsync(); 
        }
    }
}