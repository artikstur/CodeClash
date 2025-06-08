using System.Text;
using System.Text.Json;
using Application.Dtos;
using Infrastructure.RabbitMq.Contacts;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace Infrastructure.RabbitMq;

public class RabbitMqSender(ILogger<RabbitMqSender> logger): IRabbitMqSender
{
    public async Task SendMessage(TestCodeDto message, string queueName)
    {
        var hostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
    
        var factory = new ConnectionFactory
        {
            HostName = hostName,
            UserName = "guest",
            Password = "guest"
        };
    
        await using var connection = await factory.CreateConnectionAsync();
        await using var channel = await connection.CreateChannelAsync();
    
        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: false,
            exclusive: false,
            autoDelete: false,
            arguments: null);
        
        var json = JsonSerializer.Serialize(message);
        var messageBodyBytes = Encoding.UTF8.GetBytes(json);

        var props = new BasicProperties
        {
            ContentType = "application/json"
        };

        await channel.BasicPublishAsync(
            exchange: "",
            routingKey: queueName,
            mandatory: true,
            basicProperties: props,
            body: messageBodyBytes);

        logger.LogInformation("Отправлено сообщение в очередь");
    }
}