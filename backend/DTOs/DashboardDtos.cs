namespace backend.DTOs;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalLostItems { get; set; }
    public int TotalFoundItems { get; set; }
    public int RecoveredItems { get; set; }
    public int ReturnedItems { get; set; }
    public int PotentialMatches { get; set; }
    public double RecoveryRatePercentage => 
        (TotalLostItems + TotalFoundItems) > 0 
            ? Math.Round(((double)(RecoveredItems + ReturnedItems) / (TotalLostItems + TotalFoundItems)) * 100, 1) 
            : 0;
}

public class AdminDashboardStatsDto : DashboardStatsDto
{
    public int TotalReports { get; set; }
    public int PendingReports { get; set; }
    public int PendingClaims { get; set; }
    public int ActiveUsers { get; set; }
}
