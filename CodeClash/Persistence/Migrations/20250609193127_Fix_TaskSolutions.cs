using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fix_TaskSolutions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionId",
                table: "Solutions");

            migrationBuilder.DropColumn(
                name: "SolutionIds",
                table: "TaskSolutions");

            migrationBuilder.RenameColumn(
                name: "TaskSolutionId",
                table: "Solutions",
                newName: "TaskSolutionEntityId");

            migrationBuilder.RenameIndex(
                name: "IX_Solutions_TaskSolutionId",
                table: "Solutions",
                newName: "IX_Solutions_TaskSolutionEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionEntityId",
                table: "Solutions",
                column: "TaskSolutionEntityId",
                principalTable: "TaskSolutions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionEntityId",
                table: "Solutions");

            migrationBuilder.RenameColumn(
                name: "TaskSolutionEntityId",
                table: "Solutions",
                newName: "TaskSolutionId");

            migrationBuilder.RenameIndex(
                name: "IX_Solutions_TaskSolutionEntityId",
                table: "Solutions",
                newName: "IX_Solutions_TaskSolutionId");

            migrationBuilder.AddColumn<long[]>(
                name: "SolutionIds",
                table: "TaskSolutions",
                type: "bigint[]",
                nullable: false,
                defaultValue: new long[0]);

            migrationBuilder.AddForeignKey(
                name: "FK_Solutions_TaskSolutions_TaskSolutionId",
                table: "Solutions",
                column: "TaskSolutionId",
                principalTable: "TaskSolutions",
                principalColumn: "Id");
        }
    }
}
