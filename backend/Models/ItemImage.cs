using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class ItemImage
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
    [MaxLength(1000)]
    public string ImageUrl { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string PublicId { get; set; } = string.Empty;

    public bool IsPrimary { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
