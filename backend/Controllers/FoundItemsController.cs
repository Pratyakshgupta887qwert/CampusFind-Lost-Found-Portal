using backend.DTOs;
using backend.DTOs.Common;
using backend.Helpers;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/found-items")]
public class FoundItemsController : ControllerBase
{
    private readonly IFoundItemService _foundItemService;
    private readonly IMatchingService _matchingService;

    public FoundItemsController(IFoundItemService foundItemService, IMatchingService matchingService)
    {
        _foundItemService = foundItemService;
        _matchingService = matchingService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<FoundItemResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] ItemQueryParams queryParams)
    {
        var result = await _foundItemService.GetFoundItemsAsync(queryParams);
        return Ok(ApiResponse<PagedResult<FoundItemResponseDto>>.SuccessResult(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FoundItemResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _foundItemService.GetFoundItemByIdAsync(id);
        return Ok(ApiResponse<FoundItemResponseDto>.SuccessResult(item));
    }

    [Authorize]
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(ApiResponse<FoundItemResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateFoundItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var created = await _foundItemService.CreateFoundItemAsync(dto, userId, null);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<FoundItemResponseDto>.SuccessResult(created, "Found item logged successfully"));
    }

    [Authorize]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateWithFiles([FromForm] CreateFoundItemDto dto, [FromForm] List<IFormFile>? images)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var created = await _foundItemService.CreateFoundItemAsync(dto, userId, images);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<FoundItemResponseDto>.SuccessResult(created, "Found item logged successfully"));
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFoundItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var updated = await _foundItemService.UpdateFoundItemAsync(id, dto, userId, isAdmin, null);

        return Ok(ApiResponse<FoundItemResponseDto>.SuccessResult(updated, "Found item updated successfully"));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        await _foundItemService.DeleteFoundItemAsync(id, userId, isAdmin);

        return Ok(ApiResponse.SuccessResult("Found item deleted successfully"));
    }

    [Authorize]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateFoundItemStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Invalid status value"));
        }

        var userId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        var updated = await _foundItemService.UpdateStatusAsync(id, dto.Status, userId, isAdmin);

        return Ok(ApiResponse<FoundItemResponseDto>.SuccessResult(updated, "Item status updated"));
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> GetMatches(Guid id)
    {
        var matches = await _matchingService.GetMatchesForFoundItemAsync(id);
        return Ok(ApiResponse<IEnumerable<MatchResponseDto>>.SuccessResult(matches));
    }
}
