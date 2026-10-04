using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<LostItem> LostItems => Set<LostItem>();
    public DbSet<FoundItem> FoundItems => Set<FoundItem>();
    public DbSet<ItemImage> ItemImages => Set<ItemImage>();
    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Role);
            entity.HasIndex(u => u.IsActive);
        });

        // 2. LostItem configuration & indexes
        modelBuilder.Entity<LostItem>(entity =>
        {
            entity.HasIndex(i => i.Category);
            entity.HasIndex(i => i.Location);
            entity.HasIndex(i => i.Status);
            entity.HasIndex(i => i.DateLost);
            entity.HasIndex(i => i.CreatedAt);

            entity.HasOne(i => i.User)
                  .WithMany(u => u.LostItems)
                  .HasForeignKey(i => i.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Images)
                  .WithOne(img => img.LostItem)
                  .HasForeignKey(img => img.LostItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Claims)
                  .WithOne(c => c.LostItem)
                  .HasForeignKey(c => c.LostItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Notifications)
                  .WithOne(n => n.LostItem)
                  .HasForeignKey(n => n.LostItemId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(i => i.Reports)
                  .WithOne(r => r.LostItem)
                  .HasForeignKey(r => r.LostItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. FoundItem configuration & indexes
        modelBuilder.Entity<FoundItem>(entity =>
        {
            entity.HasIndex(i => i.Category);
            entity.HasIndex(i => i.Location);
            entity.HasIndex(i => i.Status);
            entity.HasIndex(i => i.DateFound);
            entity.HasIndex(i => i.CreatedAt);

            entity.HasOne(i => i.User)
                  .WithMany(u => u.FoundItems)
                  .HasForeignKey(i => i.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Images)
                  .WithOne(img => img.FoundItem)
                  .HasForeignKey(img => img.FoundItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Claims)
                  .WithOne(c => c.FoundItem)
                  .HasForeignKey(c => c.FoundItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(i => i.Reports)
                  .WithOne(r => r.FoundItem)
                  .HasForeignKey(r => r.FoundItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 4. Claim configuration
        modelBuilder.Entity<Claim>(entity =>
        {
            entity.HasIndex(c => c.Status);
            entity.HasIndex(c => c.ClaimantId);
            entity.HasIndex(c => c.CreatedAt);

            entity.HasOne(c => c.Claimant)
                  .WithMany(u => u.Claims)
                  .HasForeignKey(c => c.ClaimantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(n => n.UserId);
            entity.HasIndex(n => n.IsRead);
            entity.HasIndex(n => n.CreatedAt);

            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 6. Report configuration
        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => r.ReporterId);
            entity.HasIndex(r => r.CreatedAt);

            entity.HasOne(r => r.Reporter)
                  .WithMany(u => u.Reports)
                  .HasForeignKey(r => r.ReporterId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
