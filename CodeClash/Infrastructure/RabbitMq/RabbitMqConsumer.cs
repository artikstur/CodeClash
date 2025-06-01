using System.Text;
using System.Text.Json;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Core.Models;
using Hangfire;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Infrastructure.RabbitMq;

public class RabbitMqConsumer(ILogger<RabbitMqConsumer> logger): BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
            UserName = "guest",
            Password = "guest"
        };

        var resultsQueueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE_RESULTS") ?? "results_queue";
        var connection = await factory.CreateConnectionAsync(stoppingToken);
        var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);
        
        await channel.QueueDeclareAsync(queue: resultsQueueName,
            durable: false,
            exclusive: false,
            autoDelete: false,
            arguments: null, cancellationToken: stoppingToken);
        
        var consumer = new AsyncEventingBasicConsumer(channel);
        
        consumer.ReceivedAsync += async (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var json = Encoding.UTF8.GetString(body);
                logger.LogInformation("Получено сообщение: {json}", json);
                var result = JsonSerializer.Deserialize<ExecutionResult>(json);

                var isValid = result != null;
                if (isValid)
                {
                    BackgroundJob.Enqueue<IResultTaskService>(x => x.UpdateTaskStatusAsync(result));
                    logger.LogInformation("Поставлена задача в Hangfire на обновление");
                }

                logger.LogInformation("Получено сообщение: {result}", result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка при обработке сообщения");
            }
        };
        
        await channel.BasicConsumeAsync(queue: resultsQueueName, autoAck: true, consumer: consumer, cancellationToken: stoppingToken);
        
        logger.LogInformation("RabbitMqConsumer запущен, ожидает результаты...");
    }
}