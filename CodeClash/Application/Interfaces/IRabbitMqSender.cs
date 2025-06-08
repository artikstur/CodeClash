using Application.Dtos;

namespace Infrastructure.RabbitMq.Contacts;

public interface IRabbitMqSender
{
    Task SendMessage(TestCodeDto message, string queueName);
}