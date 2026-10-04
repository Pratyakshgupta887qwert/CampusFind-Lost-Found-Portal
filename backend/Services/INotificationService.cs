using backend.DTOs;
using backend.DTOs.Common;
using backend.Models;

namespace backend.Services;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(
        Guid userId, 
        string type, 
        string title, 
        string message, 
        Guid? lostItemId = null, 
        Guid? foundItemId = null);

    Task BroadcastNewLostItemAsync(LostItem lostItem);

    Task<PagedResult<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);

    Task<int> GetUnreadCountAsync(Guid userId);

    Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);

    Task<bool> MarkAllAsReadAsync(Guid userId);

    Task<bool> DeleteNotificationAsync(Guid notificationId, Guid userId);
}
