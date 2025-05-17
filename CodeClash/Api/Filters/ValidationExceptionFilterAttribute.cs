using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Filters;

public class ValidationExceptionFilterAttribute : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is System.ComponentModel.DataAnnotations.ValidationException validationException)
        {
            context.Result = new BadRequestObjectResult(new
            {
                error = validationException.Message
            });
            context.ExceptionHandled = true;
        }
    }
}