using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReportService> _logger;

    public ReportService(AppDbContext context, ILogger<ReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ReportResponseDto> CreateReportAsync(CreateReportDto dto, Guid reporterId)
    {
        if (!dto.LostItemId.HasValue && !dto.FoundItemId.HasValue)
        {
            throw new ArgumentException("A report must target either a Lost Item or a Found Item.");
        }

        var report = new Report
        {
            ReporterId = reporterId,
            LostItemId = dto.LostItemId,
            FoundItemId = dto.FoundItemId,
            Reason = dto.Reason,
            Description = dto.Description.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Report {ReportId} created by User {ReporterId} for reason {Reason}", report.Id, reporterId, report.Reason);

        await _context.Entry(report).Reference(r => r.Reporter).LoadAsync();
        if (report.LostItemId.HasValue) await _context.Entry(report).Reference(r => r.LostItem).LoadAsync();
        if (report.FoundItemId.HasValue) await _context.Entry(report).Reference(r => r.FoundItem).LoadAsync();

        return MapToDto(report);
    }

    public async Task<ReportResponseDto> GetReportByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var report = await _context.Reports
            .AsNoTracking()
            .Include(r => r.Reporter)
            .Include(r => r.LostItem)
            .Include(r => r.FoundItem)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null) throw new KeyNotFoundException("Report not found.");

        if (report.ReporterId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this report.");
        }

        return MapToDto(report);
    }

    public async Task<IEnumerable<ReportResponseDto>> GetAllReportsAsync(string? status = null)
    {
        var query = _context.Reports
            .AsNoTracking()
            .Include(r => r.Reporter)
            .Include(r => r.LostItem)
            .Include(r => r.FoundItem)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status.ToLower() == status.ToLower());
        }

        var reports = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return reports.Select(MapToDto);
    }

    public async Task<ReportResponseDto> UpdateReportStatusAsync(Guid id, string status)
    {
        var report = await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.LostItem)
            .Include(r => r.FoundItem)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null) throw new KeyNotFoundException("Report not found.");

        report.Status = status;
        report.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Report {ReportId} status updated to {Status}", id, status);

        return MapToDto(report);
    }

    public static ReportResponseDto MapToDto(Report r) => new()
    {
        Id = r.Id,
        ReporterId = r.ReporterId,
        ReporterName = r.Reporter?.FullName ?? "Campus Reporter",
        ReporterEmail = r.Reporter?.Email ?? string.Empty,
        LostItemId = r.LostItemId,
        LostItemTitle = r.LostItem?.Title,
        FoundItemId = r.FoundItemId,
        FoundItemTitle = r.FoundItem?.Title,
        Reason = r.Reason,
        Description = r.Description,
        Status = r.Status,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}
