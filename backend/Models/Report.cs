using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Report
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ReporterId { get; set; }
    [ForeignKey(nameof(ReporterId))]
    public User Reporter { get; set; } = null!;

    public Guid? LostItemId { get; set; }
    [ForeignKey(nameof(LostItemId))]
    public LostItem? LostItem { get; set; }

    public Guid? FoundItemId { get; set; }
    [ForeignKey(nameof(FoundItemId))]
    public FoundItem? FoundItem { get; set; }

    [Required]
    [MaxLength(100)]
    public string Reason { get; set; } = "InappropriateContent";

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Reviewed, Resolved, Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
