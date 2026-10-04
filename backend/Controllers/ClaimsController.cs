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
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimService;

    public ClaimsController(IClaimService claimService)
    {
        _claimService = claimService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClaimDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var created = await _claimService.CreateClaimAsync(dto, userId);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<ClaimResponseDto>.SuccessResult(created, "Claim submitted successfully"));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyClaims()
    {
        var userId = User.GetUserId();
        var claims = await _claimService.GetUserClaimsAsync(userId);
        return Ok(ApiResponse<IEnumerable<ClaimResponseDto>>.SuccessResult(claims));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var claim = await _claimService.GetClaimByIdAsync(id, userId, isAdmin);
        return Ok(ApiResponse<ClaimResponseDto>.SuccessResult(claim));
    }

    [HttpGet("item/{itemId:guid}")]
    public async Task<IActionResult> GetItemClaims(Guid itemId)
    {
        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var claims = await _claimService.GetItemClaimsAsync(itemId, userId, isAdmin);
        return Ok(ApiResponse<IEnumerable<ClaimResponseDto>>.SuccessResult(claims));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateClaimStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Invalid status value"));
        }

        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var updated = await _claimService.UpdateClaimStatusAsync(id, dto.Status, userId, isAdmin);

        return Ok(ApiResponse<ClaimResponseDto>.SuccessResult(updated, "Claim status updated"));
    }
}
