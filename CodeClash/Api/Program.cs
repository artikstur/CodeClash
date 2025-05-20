using Api;
using Api.Auth;
using Api.Configuration;
using Api.Configuration.Swagger;
using Application.Interfaces.Auth;
using Application.Interfaces.Repositories;
using Application.Services;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.Secrets.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

var configuration = builder.Configuration;

var services = builder.Services;

services.AddApiAuthentication(configuration);
services.AddControllers();
services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(x =>
{
    x.SchemaFilter<DefaultSchemaFilter>();
});
services.AddDbContext<WriteDbContext>(options =>
{
    options.UseNpgsql(configuration.GetConnectionString(nameof(WriteDbContext)));
});
services.Configure<JwtOptions>(configuration.GetSection(nameof(JwtOptions)));
services.AddScoped<IJwtProvider, JwtProvider>();
services.AddScoped<IPasswordHasher, PasswordHasher>();
services.AddScoped<IUsersRepository, UsersRepository>();
services.AddScoped<UsersService>();
services.AddAutoMapper();
services.AddValidators();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();