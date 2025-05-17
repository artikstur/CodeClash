using System.ComponentModel.DataAnnotations;
using Api.Filters;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[TypeFilter(typeof(ValidationExceptionFilterAttribute))]
public class BaseController: ControllerBase
{
    protected void RaiseValidationException(bool expression, string message)
    {
        if (expression)
        {
            throw new ValidationException(message);
        }
    }
    
    protected void RaiseValidationException(bool expression)
    {
        if (expression)
        {
            throw new ValidationException();
        }
    }
}