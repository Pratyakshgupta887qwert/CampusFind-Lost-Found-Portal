namespace backend.DTOs;

public class MatchResponseDto
{
    public LostItemResponseDto LostItem { get; set; } = null!;
    public FoundItemResponseDto FoundItem { get; set; } = null!;
    public int ConfidenceScore { get; set; } // 0 - 100
    public List<string> MatchReasons { get; set; } = [];
}
