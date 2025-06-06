using System.ComponentModel.DataAnnotations;
using Api.Filters;
using Core.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Api.Controllers;

[TypeFilter(typeof(ValidationExceptionFilterAttribute))]
public class BaseController(): ControllerBase
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