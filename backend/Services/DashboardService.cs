using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var totalUsers = await _context.Users.CountAsync(u => u.IsActive);
        var totalLost = await _context.LostItems.CountAsync();
        var totalFound = await _context.FoundItems.CountAsync();
        var recovered = await _context.LostItems.CountAsync(i => i.Status == "Recovered");
        var returned = await _context.FoundItems.CountAsync(i => i.Status == "Returned");
        var potentialMatches = await _context.LostItems.CountAsync(i => i.Status == "PotentialMatch") 
                             + await _context.FoundItems.CountAsync(i => i.Status == "PotentialMatch");

        return new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalLostItems = totalLost,
            TotalFoundItems = totalFound,
            RecoveredItems = recovered,
            ReturnedItems = returned,
            PotentialMatches = potentialMatches
        };
    }

    public async Task<AdminDashboardStatsDto> GetAdminStatsAsync()
    {
        var baseStats = await GetStatsAsync();
        var totalReports = await _context.Reports.CountAsync();
        var pendingReports = await _context.Reports.CountAsync(r => r.Status == "Pending");
        var pendingClaims = await _context.Claims.CountAsync(c => c.Status == "Pending");
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);

        return new AdminDashboardStatsDto
        {
            TotalUsers = baseStats.TotalUsers,
            TotalLostItems = baseStats.TotalLostItems,
            TotalFoundItems = baseStats.TotalFoundItems,
            RecoveredItems = baseStats.RecoveredItems,
            ReturnedItems = baseStats.ReturnedItems,
            PotentialMatches = baseStats.PotentialMatches,
            TotalReports = totalReports,
            PendingReports = pendingReports,
            PendingClaims = pendingClaims,
            ActiveUsers = activeUsers
        };
    }
}
