using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Filters;

[AttributeUsage(AttributeTargets.Method)]
public class EntityExistenceFilterAttribute(Type entityType): Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        long id = default;
        var hasRouteId = context.RouteData.Values.TryGetValue("id", out var routeIdObj) &&
                         long.TryParse(routeIdObj?.ToString(), out id);

        var hasQueryId = !hasRouteId &&
                         context.HttpContext.Request.Query.TryGetValue("id", out var queryIdVal) &&
                         long.TryParse(queryIdVal.ToString(), out id);

        if (!hasRouteId && !hasQueryId)
        {
            context.Result = new BadRequestObjectResult("ID не найден ни в маршруте, ни в query.");
            return;
        }
        
        var dbExtensions = context.HttpContext.RequestServices.GetRequiredService<IDbExtensions>();
        
        var method = typeof(IDbExtensions).GetMethod(nameof(IDbExtensions.CheckExistence))!;
        var genericMethod = method.MakeGenericMethod(entityType);
        var task = (Task<bool>)genericMethod.Invoke(dbExtensions, new object[] { id })!;
        
        var exists = await task;

        if (!exists)
        {
            context.Result = new NotFoundObjectResult("Сущность не найдена.");
            return;
        }

        await next();
    }
}