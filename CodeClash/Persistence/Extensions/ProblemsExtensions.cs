using System.Linq.Expressions;
using Application;
using Application.Specs;
using Persistence.Entities;

namespace Persistence.Extensions;

public static class ProblemsExtensions
{
    public static IQueryable<ProblemEntity> Filter(this IQueryable<ProblemEntity> query, ProblemsSpec spec)
    {
        if (!string.IsNullOrEmpty(spec.Name))
        {
            query = query.Where(x => x.Name.ToLower().Contains(spec.Name.ToLower()));
        }
        
        if (spec.Level != default)
        {
            query = query.Where(x => x.Level == spec.Level);
        }

        return query;
    }
    
    public static IQueryable<ProblemEntity> Sort(this IQueryable<ProblemEntity> query, ProblemsSpec spec)
    {
        return spec.SortDirection == SortDirection.Desc 
            ? query.OrderByDescending(GetKeySelector(spec))
            : query.OrderBy(GetKeySelector(spec));
    }
    
    private static Expression<Func<ProblemEntity, object>> GetKeySelector(ProblemsSpec spec)
    {
        return spec.SortBy?.ToLower() switch
        {
            nameof(spec.Name) => p => p.Name,
            nameof(spec.Level) => p => p.Level,
            _ => p => p.Id
        };
    }
    
    public static IQueryable<ProblemEntity> Page(this IQueryable<ProblemEntity> query, ProblemsSpec spec) =>
        query.Skip((spec.Page - 1) * spec.Take).Take(spec.Take);
}