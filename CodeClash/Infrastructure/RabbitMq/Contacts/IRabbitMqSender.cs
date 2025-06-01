namespace Infrastructure.RabbitMq.Contacts;

public interface IRabbitMqSender
{
    Task SendMessage(string message, string queueName);
}