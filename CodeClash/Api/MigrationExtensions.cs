using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Api;

public static class MigrationExtensions
{
    public static IServiceProvider ApplyMigrations(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var provider = scope.ServiceProvider;

        try
        {
            var logger = provider.GetRequiredService<ILogger<Program>>();
            var db = provider.GetRequiredService<WriteDbContext>();

            logger.LogInformation("Применение миграций...");
            db.Database.Migrate();
            logger.LogInformation("Миграции успешно применены.");
        }
        catch (Exception ex)
        {
            var logger = provider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Ошибка при применении миграций.");
        }

        return services;
    }
}