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
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var reporterId = User.GetUserId();
        var created = await _reportService.CreateReportAsync(dto, reporterId);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<ReportResponseDto>.SuccessResult(created, "Report submitted to campus moderators"));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var report = await _reportService.GetReportByIdAsync(id, userId, isAdmin);

        return Ok(ApiResponse<ReportResponseDto>.SuccessResult(report));
    }
}
