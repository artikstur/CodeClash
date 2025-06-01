using RabbitMQ.Client;

namespace TestsWorker.Dtos;

public class SendMessageDto
{
    public string QueueName { get; set; }

    public IChannel Channel { get; set; }
    
    public string Message { get; set; }
}