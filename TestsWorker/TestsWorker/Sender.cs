using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using TestsWorker.Dtos;

namespace TestsWorker;

public static class Sender
{
    public static async Task SendMessage(SendMessageDto sendMessageDto)
    {
        var data = JsonSerializer.Serialize(sendMessageDto.Message);
        var messageBodyBytes = Encoding.UTF8.GetBytes(data);
        var props = new BasicProperties
        {
            ContentType = "application/json"
        };

        await sendMessageDto.Channel.BasicPublishAsync("", sendMessageDto.QueueName, mandatory: true,
            basicProperties: props, body: messageBodyBytes);
    }
}