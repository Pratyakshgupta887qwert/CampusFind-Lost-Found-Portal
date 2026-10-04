using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateLostItemDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required(ErrorMessage = "Location is required")]
    [MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date lost is required")]
    public DateTime DateLost { get; set; }

    [MaxLength(50)]
    public string? TimeLost { get; set; }

    [MaxLength(1000)]
    public string? AdditionalInformation { get; set; }

    [MaxLength(100)]
    public string? Reward { get; set; }

    [MaxLength(50)]
    public string Urgency { get; set; } = "Medium";

    // Optional direct image URLs or handled via multipart upload
    public List<string>? ImageUrls { get; set; }
}

public class UpdateLostItemDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required(ErrorMessage = "Location is required")]
    [MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date lost is required")]
    public DateTime DateLost { get; set; }

    [MaxLength(50)]
    public string? TimeLost { get; set; }

    [MaxLength(1000)]
    public string? AdditionalInformation { get; set; }

    [MaxLength(100)]
    public string? Reward { get; set; }

    [MaxLength(50)]
    public string Urgency { get; set; } = "Medium";

    public List<string>? ImageUrls { get; set; }
}

public class UpdateLostItemStatusDto
{
    [Required]
    [RegularExpression("^(Lost|PotentialMatch|Recovered|Closed)$", ErrorMessage = "Status must be Lost, PotentialMatch, Recovered, or Closed")]
    public string Status { get; set; } = string.Empty;
}

public class ItemImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public class LostItemResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime DateLost { get; set; }
    public string? TimeLost { get; set; }
    public string? AdditionalInformation { get; set; }
    public string? Reward { get; set; }
    public string Urgency { get; set; } = "Medium";
    public string Status { get; set; } = "Lost";
    public Guid UserId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string? ReporterEmail { get; set; }
    public string? ReporterPhone { get; set; }
    public string ReferenceCode => $"CF-LST-{Id.ToString()[..6].ToUpper()}";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ItemImageDto> Images { get; set; } = [];
}
