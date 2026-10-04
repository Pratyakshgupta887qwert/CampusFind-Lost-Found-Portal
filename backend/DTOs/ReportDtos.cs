using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateReportDto
{
    public Guid? LostItemId { get; set; }
    public Guid? FoundItemId { get; set; }

    [Required(ErrorMessage = "Reason is required")]
    [MaxLength(100)]
    public string Reason { get; set; } = "InappropriateContent"; // Spam, FakePost, InappropriateContent, SuspiciousListing, IncorrectInformation

    [Required(ErrorMessage = "Description is required")]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}

public class UpdateReportStatusDto
{
    [Required]
    [RegularExpression("^(Pending|Reviewed|Resolved|Rejected)$", ErrorMessage = "Status must be Pending, Reviewed, Resolved, or Rejected")]
    public string Status { get; set; } = string.Empty;
}

public class ReportResponseDto
{
    public Guid Id { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public Guid? LostItemId { get; set; }
    public string? LostItemTitle { get; set; }
    public Guid? FoundItemId { get; set; }
    public string? FoundItemTitle { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
