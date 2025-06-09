using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_TaskSolutions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TaskSolutionId",
                table: "Solutions",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaskSolutions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    SolutionIds = table.Column<long[]>(type: "bigint[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskSolutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskSolutions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Solutions_TaskSolutionId",
                table: "Solutions",
                column: "TaskSolutionId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSolutions_UserId",
                table: "TaskSolutions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionId",
                table: "Solutions",
                column: "TaskSolutionId",
                principalTable: "TaskSolutions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionId",
                table: "Solutions");

            migrationBuilder.DropTable(
                name: "TaskSolutions");

            migrationBuilder.DropIndex(
                name: "IX_Solutions_TaskSolutionId",
                table: "Solutions");

            migrationBuilder.DropColumn(
                name: "TaskSolutionId",
                table: "Solutions");
        }
    }
}
