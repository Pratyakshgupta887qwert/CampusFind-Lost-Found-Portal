using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ProfileImageUrl { get; set; }

    [MaxLength(25)]
    public string? PhoneNumber { get; set; }

    [MaxLength(50)]
    public string? StudentOrStaffId { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "User"; // "User", "Admin"

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<LostItem> LostItems { get; set; } = new List<LostItem>();
    public ICollection<FoundItem> FoundItems { get; set; } = new List<FoundItem>();
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
}
