using Api.Contracts;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Configuration.Swagger;

public class DefaultSchemaFilter: ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(LoginUserRequest))
        {
            schema.Example = new OpenApiObject
            {
                ["email"] = new OpenApiString("string123@mail.ru"),
                ["password"] = new OpenApiString("String123")
            };
        }
        else if (context.Type == typeof(RegisterUserRequest))
        {
            schema.Example = new OpenApiObject
            {
                ["userName"] = new OpenApiString("string123"),
                ["password"] = new OpenApiString("String123"),
                ["email"] = new OpenApiString("string123@mail.ru")
            };
        }
    }
}