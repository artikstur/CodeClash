using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace Infrastructure.RabbitMq;

public class RabbitMqService: IRabbitMqService
{
    public async Task SendMessage(object obj)
    {
        var message = JsonSerializer.Serialize(obj);
        await SendMessage(message);
    }

    public async Task SendMessage(string message)
    {
        var hostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var queueName = Environment.GetEnvironmentVariable("RABBITMQ_QUEUE") ?? "my_queue";
        
        var factory = new ConnectionFactory
        {
            HostName = hostName,
            UserName = "guest",
            Password = "guest"
        };
        
        await using var connection = await factory.CreateConnectionAsync();
        await using var channel = await connection.CreateChannelAsync();
        
        await channel.QueueDeclareAsync(queue: queueName,
            durable: false,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        var messageBodyBytes  = Encoding.UTF8.GetBytes(message);
        var props = new BasicProperties
        {
            ContentType = "text/plain"
        };

        await channel.BasicPublishAsync("", queueName, mandatory: true, basicProperties: props, body: messageBodyBytes);
    }
}