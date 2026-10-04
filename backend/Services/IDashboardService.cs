using backend.DTOs;

namespace backend.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<AdminDashboardStatsDto> GetAdminStatsAsync();
}
