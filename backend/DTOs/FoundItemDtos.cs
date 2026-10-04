using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateFoundItemDto
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

    [Required(ErrorMessage = "Date found is required")]
    public DateTime DateFound { get; set; }

    [MaxLength(50)]
    public string? TimeFound { get; set; }

    [MaxLength(1000)]
    public string? AdditionalInformation { get; set; }

    [MaxLength(250)]
    public string? HoldingLocation { get; set; }

    [MaxLength(500)]
    public string? VerificationHint { get; set; }

    public List<string>? ImageUrls { get; set; }
}

public class UpdateFoundItemDto
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

    [Required(ErrorMessage = "Date found is required")]
    public DateTime DateFound { get; set; }

    [MaxLength(50)]
    public string? TimeFound { get; set; }

    [MaxLength(1000)]
    public string? AdditionalInformation { get; set; }

    [MaxLength(250)]
    public string? HoldingLocation { get; set; }

    [MaxLength(500)]
    public string? VerificationHint { get; set; }

    public List<string>? ImageUrls { get; set; }
}

public class UpdateFoundItemStatusDto
{
    [Required]
    [RegularExpression("^(Found|PotentialMatch|Returned|Closed)$", ErrorMessage = "Status must be Found, PotentialMatch, Returned, or Closed")]
    public string Status { get; set; } = string.Empty;
}

public class FoundItemResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime DateFound { get; set; }
    public string? TimeFound { get; set; }
    public string? AdditionalInformation { get; set; }
    public string? HoldingLocation { get; set; }
    public string? VerificationHint { get; set; }
    public string Status { get; set; } = "Found";
    public Guid UserId { get; set; }
    public string FinderName { get; set; } = string.Empty;
    public string? FinderEmail { get; set; }
    public string? FinderPhone { get; set; }
    public string ReferenceCode => $"CF-FND-{Id.ToString()[..6].ToUpper()}";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ItemImageDto> Images { get; set; } = [];
}
