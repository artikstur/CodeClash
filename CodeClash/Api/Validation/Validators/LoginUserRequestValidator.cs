using Api.Contracts;
using FluentValidation;

namespace Api.Validation.Validators;

public class LoginUserRequestValidator : AbstractValidator<LoginUserRequest>
{
    public LoginUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email обязателен")
            .EmailAddress().WithMessage("Некорректный формат email");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Пароль обязателен")
            .MinimumLength(6).WithMessage("Пароль должен быть не менее 6 символов");
    }
}