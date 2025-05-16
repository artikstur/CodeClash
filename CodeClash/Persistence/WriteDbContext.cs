using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence;

public class WriteDbContext(DbContextOptions<WriteDbContext> options) : DbContext(options)
{
    public DbSet<UserEntity> Users { get; set; }
}