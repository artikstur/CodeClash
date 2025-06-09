using Api;
using Api.Auth;
using Api.Configuration;
using Api.Configuration.Swagger;
using Api.MIddlewares;
using Application.Interfaces;
using Application.Interfaces.Auth;
using Application.Interfaces.Repositories;
using Application.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Infrastructure.RabbitMq;
using Infrastructure.RabbitMq.Contacts;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Repositories;
using Serilog;

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
services.AddScoped<IProblemsRepository, ProblemsRepository>();
services.AddScoped<ProblemsService>();
services.AddScoped<ITestCasesRepository, TestCasesRepository>();
services.AddScoped<TestCasesService>();
services.AddScoped<SolutionsService>();
services.AddScoped<ISolutionsRepository, SolutionsRepository>();
services.AddAutoMapper();
services.AddValidators();
services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
services.AddScoped<IDbExtensions, DbExtensions>();
services.AddScoped<IRabbitMqSender, RabbitMqSender>();
services.AddScoped<ITaskSolutionRepository, TaskSolutionRepository>();
services.AddHangfire(config =>
    config.UsePostgreSqlStorage(options =>
    {
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString(nameof(WriteDbContext)));
    }));
builder.Services.AddHangfireServer();
builder.Services.AddScoped<IResultTaskService, ResultTaskService>();
builder.Services.AddHostedService<RabbitMqConsumer>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Seq(configuration["Serilog:WriteTo:0:Args:serverUrl"] ?? "http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();

var app = builder.Build();
app.Services.ApplyMigrations();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<UserDataLoggingMiddleware>();
app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "Завершена обработка: {RequestPath} {StatusCode} in {Elapsed:0.0000} ms [EmailHash: {EmailHash}]";
});
app.MapControllers();

app.Run();
