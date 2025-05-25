using Core.Utils;

namespace Application.Interfaces;

public interface IDbExtensions
{
    Task<bool> CheckExistence<TEntity>(long id) where TEntity : LongIdBase;
}