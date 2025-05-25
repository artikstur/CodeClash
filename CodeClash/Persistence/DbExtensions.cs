using Application.Interfaces;
using Core.Utils;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class DbExtensions(WriteDbContext writeDbContext): IDbExtensions
{
    public async Task<bool> CheckExistence<TEntity>(long id) where TEntity: LongIdBase 
        => await writeDbContext.Set<TEntity>().AnyAsync(x => x.Id == id);
}