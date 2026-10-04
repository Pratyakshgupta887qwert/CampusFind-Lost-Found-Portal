using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Notification
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public Guid? LostItemId { get; set; }
    [ForeignKey(nameof(LostItemId))]
    public LostItem? LostItem { get; set; }

    public Guid? FoundItemId { get; set; }
    [ForeignKey(nameof(FoundItemId))]
    public FoundItem? FoundItem { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "General";

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
