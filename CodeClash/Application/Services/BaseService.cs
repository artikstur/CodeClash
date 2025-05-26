using System.ComponentModel.DataAnnotations;

namespace Application.Services;

public class BaseService
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