using System.ComponentModel.DataAnnotations;

namespace Api.Contracts;

public record LoginUserRequest(
    [Required] string Email,
    [Required] string Password);