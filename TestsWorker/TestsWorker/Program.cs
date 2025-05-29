using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;

namespace TestsWorker;

public static class Program
{
    static async Task Main(string[] args)
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

        var consumer = new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            Console.WriteLine($"Получено: {message}");
            return Task.CompletedTask;
        };

        await channel.BasicConsumeAsync(queue: queueName, autoAck: true, consumer: consumer);

        Console.WriteLine("Нажмите enter для выхода.");
        Console.ReadLine();
    }
}
