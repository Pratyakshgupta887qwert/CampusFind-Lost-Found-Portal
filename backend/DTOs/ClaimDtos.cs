using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateClaimDto
{
    public Guid? LostItemId { get; set; }
    public Guid? FoundItemId { get; set; }

    [Required(ErrorMessage = "Message is required")]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? ProofDetails { get; set; }
}

public class UpdateClaimStatusDto
{
    [Required]
    [RegularExpression("^(Pending|Approved|Rejected|Cancelled)$", ErrorMessage = "Status must be Pending, Approved, Rejected, or Cancelled")]
    public string Status { get; set; } = string.Empty;
}

public class ClaimResponseDto
{
    public Guid Id { get; set; }
    public Guid? LostItemId { get; set; }
    public string? LostItemTitle { get; set; }
    public Guid? FoundItemId { get; set; }
    public string? FoundItemTitle { get; set; }
    public Guid ClaimantId { get; set; }
    public string ClaimantName { get; set; } = string.Empty;
    public string ClaimantEmail { get; set; } = string.Empty;
    public string? ClaimantPhone { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ProofDetails { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
