using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Claim
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? LostItemId { get; set; }
    [ForeignKey(nameof(LostItemId))]
    public LostItem? LostItem { get; set; }

    public Guid? FoundItemId { get; set; }
    [ForeignKey(nameof(FoundItemId))]
    public FoundItem? FoundItem { get; set; }

    [Required]
    public Guid ClaimantId { get; set; }
    [ForeignKey(nameof(ClaimantId))]
    public User Claimant { get; set; } = null!;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string? ProofDetails { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
