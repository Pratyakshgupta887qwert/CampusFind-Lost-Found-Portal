namespace backend.DTOs.Common;

public class ItemQueryParams
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? Location { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Sort { get; set; } = "newest"; // newest, oldest, updated
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
