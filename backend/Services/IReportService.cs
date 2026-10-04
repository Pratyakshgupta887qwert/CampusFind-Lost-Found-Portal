using backend.DTOs;

namespace backend.Services;

public interface IReportService
{
    Task<ReportResponseDto> CreateReportAsync(CreateReportDto dto, Guid reporterId);
    Task<ReportResponseDto> GetReportByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<IEnumerable<ReportResponseDto>> GetAllReportsAsync(string? status = null);
    Task<ReportResponseDto> UpdateReportStatusAsync(Guid id, string status);
}
