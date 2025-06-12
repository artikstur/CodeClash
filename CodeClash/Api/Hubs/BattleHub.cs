using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Api.Contracts.ProblemsController;

namespace Api.Hubs;

public class BattleHub : Hub
{
    private static ConcurrentDictionary<string, List<string>> Rooms = new();
    private static ConcurrentDictionary<string, string> ConnectionNicknames = new();
    private static ConcurrentDictionary<string, GetProblemResponse> RoomProblems = new();
    private static ConcurrentDictionary<string, int> RoomTimers = new();
    private static ConcurrentDictionary<string, CancellationTokenSource> RoomTimerTokens = new();
    private static ConcurrentDictionary<string, Dictionary<string, int>> RoomProgresses = new();

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
    
    public async Task SetDifficulty(string roomCode, int level)
    {
        await Clients.Group(roomCode).SendAsync("DifficultyUpdated", level);
    }
    
    public async Task StartGame(string roomCode, GetProblemResponse problem)
    {
        RoomProblems[roomCode] = problem;
        RoomProgresses[roomCode] = new();
        
        if (RoomTimerTokens.TryGetValue(roomCode, out var existingCts))
        {
            existingCts.Cancel();
        }

        var cts = new CancellationTokenSource();
        RoomTimerTokens[roomCode] = cts;

        await Clients.Group(roomCode).SendAsync("StartGame", problem);
        
        await StartCountdown(roomCode, cts.Token);
    }

    private async Task StartCountdown(string roomCode, CancellationToken token)
    {
        int seconds = 10;
        RoomTimers[roomCode] = seconds;

        while (seconds > 0 && !token.IsCancellationRequested)
        {
            await Clients.Group(roomCode).SendAsync("TimerUpdate", seconds);
            await Task.Delay(1000, token);
            seconds--;
        }
        
        await Clients.Group(roomCode).SendAsync("TimerUpdate", 0);

        if (!token.IsCancellationRequested)
        {
            await DecideWinner(roomCode);
        }
    }

    public async Task UpdateProgress(string roomCode, int progress, string nickname)
    {
        if (!RoomProgresses.ContainsKey(roomCode))
            RoomProgresses[roomCode] = new();

        RoomProgresses[roomCode][nickname] = progress;

        await Clients.Group(roomCode).SendAsync("ReceiveProgressUpdate", nickname, progress);

        if (progress >= 100)
        {
            if (RoomTimerTokens.TryGetValue(roomCode, out var cts))
            {
                cts.Cancel();
            }

            await Clients.Group(roomCode).SendAsync("GameOver", nickname);
        }
    }

    private async Task DecideWinner(string roomCode)
    {
        if (!RoomProgresses.TryGetValue(roomCode, out var progresses) || progresses.Count == 0)
        {
            await Clients.Group(roomCode).SendAsync("GameOver", null);
            return;
        }

        var winner = progresses.OrderByDescending(p => p.Value).First();
        await Clients.Group(roomCode).SendAsync("GameOver", winner.Key); 
    }
}