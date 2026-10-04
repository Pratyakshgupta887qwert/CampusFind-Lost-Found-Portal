namespace backend.DTOs;

public class NotificationResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? LostItemId { get; set; }
    public Guid? FoundItemId { get; set; }
    public string Type { get; set; } = "General";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UnreadCountDto
{
    public int UnreadCount { get; set; }
}
