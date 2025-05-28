using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Filters;

[AttributeUsage(AttributeTargets.Method)]
public class UserIdFilterAttribute: Attribute, IAsyncActionFilter
{
    public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var id = context.HttpContext.User.FindFirst("sub")?.Value;

        if (id is null)
        {
            context.Result = new ForbidResult();
        }
        
        context.HttpContext.Items.Add("userId", id);
        return Task.CompletedTask;
    }
}