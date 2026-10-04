using backend.DTOs;
using backend.DTOs.Common;
using backend.Helpers;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.GetUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
        return Ok(ApiResponse<PagedResult<NotificationResponseDto>>.SuccessResult(result));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = User.GetUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(ApiResponse<UnreadCountDto>.SuccessResult(new UnreadCountDto { UnreadCount = count }));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = User.GetUserId();
        var success = await _notificationService.MarkAsReadAsync(id, userId);
        if (!success) return NotFound(ApiResponse.ErrorResult("Notification not found"));
        return Ok(ApiResponse.SuccessResult("Notification marked as read"));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.GetUserId();
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse.SuccessResult("All notifications marked as read"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var success = await _notificationService.DeleteNotificationAsync(id, userId);
        if (!success) return NotFound(ApiResponse.ErrorResult("Notification not found"));
        return Ok(ApiResponse.SuccessResult("Notification deleted"));
    }
}
