using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence;

public class WriteDbContext(DbContextOptions<WriteDbContext> options) : DbContext(options)
{
    public DbSet<UserEntity> Users { get; set; }
    
    public DbSet<ProblemEntity> Problems { get; set; }
    
    public DbSet<TestCaseEntity> TestCases { get; set; }
    
    public DbSet<SolutionEntity> Solutions { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProblemEntity>().HasIndex(p => p.Name).IsUnique();
    }
}