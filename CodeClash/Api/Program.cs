using System.Reflection;
using Api;
using Api.Auth;
using Api.Configuration;
using Application.Interfaces.Auth;
using Application.Interfaces.Repositories;
using Application.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.Secrets.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

var configuration = builder.Configuration;

var services = builder.Services;

services.AddApiAuthentication(configuration);
services.AddControllers();
services.AddEndpointsApiExplorer();
services.AddSwaggerGen();
services.AddDbContext<WriteDbContext>(options =>
{
    options.UseNpgsql(configuration.GetConnectionString(nameof(WriteDbContext)));
});
services.Configure<JwtOptions>(configuration.GetSection(nameof(JwtOptions)));
services.AddScoped<IJwtProvider, JwtProvider>();
services.AddScoped<IPasswordHasher, PasswordHasher>();
services.AddAutoMapper(Assembly.GetExecutingAssembly());
services.AddScoped<IUsersRepository, UsersRepository>();
services.AddScoped<UsersService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

app.MapControllers();

app.Run();