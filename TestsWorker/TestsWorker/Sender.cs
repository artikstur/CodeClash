using System.Text;
using RabbitMQ.Client;
using TestsWorker.Dtos;

namespace TestsWorker;

public static class Sender
{
    public static async Task SendMessage(SendMessageDto sendMessageDto)
    {
        var messageBodyBytes = Encoding.UTF8.GetBytes(sendMessageDto.Message);
        var props = new BasicProperties
        {
            ContentType = "application/json"
        };

        await sendMessageDto.Channel.BasicPublishAsync("", sendMessageDto.QueueName, mandatory: true,
            basicProperties: props, body: messageBodyBytes);
    }
}