using backend.Data;
using backend.DTOs;
using backend.DTOs.Common;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext context, 
        IHubContext<NotificationHub> hubContext, 
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<Notification> CreateNotificationAsync(
        Guid userId, 
        string type, 
        string title, 
        string message, 
        Guid? lostItemId = null, 
        Guid? foundItemId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            LostItemId = lostItemId,
            FoundItemId = foundItemId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Dispatch real-time SignalR event
        try
        {
            var dto = MapToDto(notification);
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification to user {UserId}", userId);
        }

        return notification;
    }

    public async Task BroadcastNewLostItemAsync(LostItem lostItem)
    {
        // Get all active users except the owner
        var recipientUserIds = await _context.Users
            .Where(u => u.IsActive && u.Id != lostItem.UserId)
            .Select(u => u.Id)
            .ToListAsync();

        if (recipientUserIds.Count == 0) return;

        var notifications = recipientUserIds.Select(uid => new Notification
        {
            UserId = uid,
            Type = "LostItemCreated",
            Title = "New Lost Item Reported",
            Message = $"A '{lostItem.Title}' was reported lost near {lostItem.Location}.",
            LostItemId = lostItem.Id,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _context.Notifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();

        try
        {
            // Broadcast live event to all connected campus clients
            await _hubContext.Clients.Group("campus_broadcast").SendAsync("LostItemBroadcast", new
            {
                id = lostItem.Id,
                title = lostItem.Title,
                category = lostItem.Category,
                location = lostItem.Location,
                createdAt = lostItem.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast new lost item via SignalR");
        }
    }

    public async Task<PagedResult<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => MapToDto(n))
            .ToListAsync();

        return new PagedResult<NotificationResponseDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (unread.Count == 0) return true;

        foreach (var n in unread)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    private static NotificationResponseDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        LostItemId = n.LostItemId,
        FoundItemId = n.FoundItemId,
        Type = n.Type,
        Title = n.Title,
        Message = n.Message,
        IsRead = n.IsRead,
        CreatedAt = n.CreatedAt
    };
}
