using backend.DTOs;
using backend.DTOs.Common;
using backend.Helpers;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/lost-items")]
public class LostItemsController : ControllerBase
{
    private readonly ILostItemService _lostItemService;
    private readonly IMatchingService _matchingService;

    public LostItemsController(ILostItemService lostItemService, IMatchingService matchingService)
    {
        _lostItemService = lostItemService;
        _matchingService = matchingService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<LostItemResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] ItemQueryParams queryParams)
    {
        var result = await _lostItemService.GetLostItemsAsync(queryParams);
        return Ok(ApiResponse<PagedResult<LostItemResponseDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LostItemResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _lostItemService.GetLostItemByIdAsync(id);
        return Ok(ApiResponse<LostItemResponseDto>.SuccessResult(item));
    }

    [Authorize]
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(ApiResponse<LostItemResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateLostItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var created = await _lostItemService.CreateLostItemAsync(dto, userId, null);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<LostItemResponseDto>.SuccessResult(created, "Lost item reported successfully"));
    }

    [Authorize]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateWithFiles([FromForm] CreateLostItemDto dto, [FromForm] List<IFormFile>? images)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var created = await _lostItemService.CreateLostItemAsync(dto, userId, images);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<LostItemResponseDto>.SuccessResult(created, "Lost item reported successfully"));
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLostItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var updated = await _lostItemService.UpdateLostItemAsync(id, dto, userId, isAdmin, null);

        return Ok(ApiResponse<LostItemResponseDto>.SuccessResult(updated, "Lost item updated successfully"));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        await _lostItemService.DeleteLostItemAsync(id, userId, isAdmin);

        return Ok(ApiResponse.SuccessResult("Lost item deleted successfully"));
    }

    [Authorize]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLostItemStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Invalid status value"));
        }

        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var updated = await _lostItemService.UpdateStatusAsync(id, dto.Status, userId, isAdmin);

        return Ok(ApiResponse<LostItemResponseDto>.SuccessResult(updated, "Item status updated"));
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> GetMatches(Guid id)
    {
        var matches = await _matchingService.GetMatchesForLostItemAsync(id);
        return Ok(ApiResponse<IEnumerable<MatchResponseDto>>.SuccessResult(matches));
    }
}
