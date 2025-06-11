using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Api.Hubs;

public class BattleHub : Hub
{
    private static ConcurrentDictionary<string, List<string>> Rooms = new();
    private static ConcurrentDictionary<string, string> ConnectionNicknames = new();

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (ConnectionNicknames.TryRemove(Context.ConnectionId, out var nickname))
        {
            foreach (var room in Rooms)
            {
                if (room.Value.Contains(Context.ConnectionId))
                {
                    room.Value.Remove(Context.ConnectionId);
                    await Clients.Group(room.Key).SendAsync("UserLeft", Context.ConnectionId, nickname);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(string roomCode, string nickname)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        if (!Rooms.ContainsKey(roomCode))
        {
            Rooms[roomCode] = new List<string>();
        }
        
        var existingUsers = Rooms[roomCode]
            .Where(connId => connId != Context.ConnectionId)
            .Select(connId => new { ConnectionId = connId, Nickname = ConnectionNicknames[connId] })
            .ToList();

        foreach (var user in existingUsers)
        {
            await Clients.Caller.SendAsync("UserJoined", user.ConnectionId, user.Nickname);
        }

        Rooms[roomCode].Add(Context.ConnectionId);
        ConnectionNicknames[Context.ConnectionId] = nickname;
        
        await Clients.Group(roomCode).SendAsync("UserJoined", Context.ConnectionId, nickname);
    }

    public async Task SendReadyStatus(string roomCode, string nickname, bool isReady)
    {
        await Clients.Group(roomCode).SendAsync("ReceiveReadyStatus", Context.ConnectionId, nickname, isReady);
    }

    public async Task StartGame(string roomCode)
    {
        await Clients.Group(roomCode).SendAsync("StartGame");
    }
}
