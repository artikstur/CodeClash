using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Filters;

[AttributeUsage(AttributeTargets.Method)]
public class UserIdFilterAttribute: Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var id = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (id is null)
        {
            context.Result = new ForbidResult();
            return;
        }
        
        if (!long.TryParse(id, out var userId))
        {
            context.Result = new BadRequestObjectResult("Invalid user ID format");
            return;
        }
        
        context.HttpContext.Items.Add("userId", userId);
        await next();
    }
}