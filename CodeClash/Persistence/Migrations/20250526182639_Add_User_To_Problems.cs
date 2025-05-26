using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_User_To_Problems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "Problems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Problems_Name",
                table: "Problems",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Problems_UserId",
                table: "Problems",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Problems_Users_UserId",
                table: "Problems",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Problems_Users_UserId",
                table: "Problems");

            migrationBuilder.DropIndex(
                name: "IX_Problems_Name",
                table: "Problems");

            migrationBuilder.DropIndex(
                name: "IX_Problems_UserId",
                table: "Problems");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Problems");
        }
    }
}
