using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Api.Contracts.ProblemsController;

namespace Api.Hubs;

public class BattleHub : Hub
{
    private static readonly ConcurrentDictionary<string, List<string>> _rooms = new();
    private static readonly ConcurrentDictionary<string, string> _connectionNicknames = new();
    private static readonly ConcurrentDictionary<string, GetProblemResponse> _roomProblems = new();
    private static readonly ConcurrentDictionary<string, int> _roomTimers = new();
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _roomTimerTokens = new();
    private static readonly ConcurrentDictionary<string, Dictionary<string, int>> _roomProgresses = new();

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connectionNicknames.TryRemove(Context.ConnectionId, out var nickname))
        {
            foreach (var kvp in _rooms)
            {
                var roomCode = kvp.Key;
                var connections = kvp.Value;

                if (!connections.Contains(Context.ConnectionId)) continue;
                connections.Remove(Context.ConnectionId);
                await Clients.Group(roomCode).SendAsync("UserLeft", Context.ConnectionId, nickname);
                    
                switch (connections.Count)
                {
                    case 0:
                        CleanupRoom(roomCode);
                        break;
                    case 1:
                    {
                        var remainingConnId = connections.First();
                        if (_connectionNicknames.TryGetValue(remainingConnId, out var winnerNickname))
                        {
                            await Clients.Group(roomCode).SendAsync("GameOver", winnerNickname, "Противник отключился");
                            CleanupRoom(roomCode);
                        }

                        break;
                    }
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(string roomCode, string nickname)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        if (!_rooms.ContainsKey(roomCode))
        {
            _rooms[roomCode] = new List<string>();
        }

        var existingUsers = _rooms[roomCode]
            .Where(connId => connId != Context.ConnectionId)
            .Select(connId => new { ConnectionId = connId, Nickname = _connectionNicknames[connId] })
            .ToList();

        foreach (var user in existingUsers)
        {
            await Clients.Caller.SendAsync("UserJoined", user.ConnectionId, user.Nickname);
        }

        _rooms[roomCode].Add(Context.ConnectionId);
        _connectionNicknames[Context.ConnectionId] = nickname;

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
        _roomProblems[roomCode] = problem;
        _roomProgresses[roomCode] = new();
        
        if (_roomTimerTokens.TryGetValue(roomCode, out var existingCts))
        {
            existingCts.Cancel();
        }

        var cts = new CancellationTokenSource();
        _roomTimerTokens[roomCode] = cts;

        await Clients.Group(roomCode).SendAsync("StartGame", problem);
        
        await StartCountdown(roomCode, cts.Token);
    }

    private async Task StartCountdown(string roomCode, CancellationToken token)
    {
        int seconds = 30;
        _roomTimers[roomCode] = seconds;

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
        if (!_roomProgresses.ContainsKey(roomCode))
            _roomProgresses[roomCode] = new();

        _roomProgresses[roomCode][nickname] = progress;

        await Clients.Group(roomCode).SendAsync("ReceiveProgressUpdate", nickname, progress);

        if (progress >= 100)
        {
            if (_roomTimerTokens.TryGetValue(roomCode, out var cts))
            {
                cts.Cancel();
            }

            await Clients.Group(roomCode).SendAsync("GameOver", nickname);

            CleanupRoom(roomCode);
        }
    }

    private async Task DecideWinner(string roomCode)
    {
        if (!_roomProgresses.TryGetValue(roomCode, out var progresses) || progresses.Count == 0)
        {
            await Clients.Group(roomCode).SendAsync("GameOver", null);
            return;
        }

        var winner = progresses.OrderByDescending(p => p.Value).First();
        await Clients.Group(roomCode).SendAsync("GameOver", winner.Key); 
        
        CleanupRoom(roomCode);
    }
    
    private void CleanupRoom(string roomCode)
    {
        _rooms.TryRemove(roomCode, out _);
        _roomProblems.TryRemove(roomCode, out _);
        _roomTimers.TryRemove(roomCode, out _);
    
        if (_roomTimerTokens.TryRemove(roomCode, out var cts))
        {
            cts.Dispose();
        }

        _roomProgresses.TryRemove(roomCode, out _);
        
        var connectionIdsToRemove = _connectionNicknames
            .Where(kvp => _rooms.TryGetValue(roomCode, out var list) && list.Contains(kvp.Key))
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var connId in connectionIdsToRemove)
        {
            _connectionNicknames.TryRemove(connId, out _);
        }
    }
}