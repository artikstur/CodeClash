namespace Infrastructure.RabbitMq;

public interface IRabbitMqService
{
    Task SendMessage(object obj);
    Task SendMessage(string message);
}