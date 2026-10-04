using backend.Data;
using backend.DTOs;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IReportService _reportService;
    private readonly IDashboardService _dashboardService;

    public AdminController(
        AppDbContext context, 
        IReportService reportService, 
        IDashboardService dashboardService)
    {
        _context = context;
        _reportService = reportService;
        _dashboardService = dashboardService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt);

        var total = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => AuthService.MapToUserDto(u))
            .ToListAsync();

        return Ok(ApiResponse<PagedResult<UserDto>>.SuccessResult(new PagedResult<UserDto>
        {
            Items = users,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        }));
    }

    [HttpPatch("users/{id:guid}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id, [FromBody] bool isActive)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.ErrorResult("User not found"));

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResult($"User status updated to {(isActive ? "Active" : "Inactive")}"));
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports([FromQuery] string? status)
    {
        var reports = await _reportService.GetAllReportsAsync(status);
        return Ok(ApiResponse<IEnumerable<ReportResponseDto>>.SuccessResult(reports));
    }

    [HttpPatch("reports/{id:guid}")]
    public async Task<IActionResult> UpdateReportStatus(Guid id, [FromBody] UpdateReportStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Invalid status value"));
        }

        var updated = await _reportService.UpdateReportStatusAsync(id, dto.Status);
        return Ok(ApiResponse<ReportResponseDto>.SuccessResult(updated, "Report status updated"));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetAdminStats()
    {
        var stats = await _dashboardService.GetAdminStatsAsync();
        return Ok(ApiResponse<AdminDashboardStatsDto>.SuccessResult(stats));
    }
}
