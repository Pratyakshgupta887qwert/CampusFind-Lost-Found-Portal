using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class FoundItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    public DateTime DateFound { get; set; }

    [MaxLength(50)]
    public string? TimeFound { get; set; }

    [MaxLength(1000)]
    public string? AdditionalInformation { get; set; }

    [MaxLength(250)]
    public string? HoldingLocation { get; set; } // e.g. "Main Campus Safety HQ", "Student Union Info Desk"

    [MaxLength(500)]
    public string? VerificationHint { get; set; } // Secret anti-fraud challenge prompt

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Found"; // Found, PotentialMatch, Returned, Closed

    [Required]
    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
}
