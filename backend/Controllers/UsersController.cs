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
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.GetUserId();
        var user = await _userService.GetProfileAsync(userId);
        return Ok(ApiResponse<UserDto>.SuccessResult(user));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        var updated = await _userService.UpdateProfileAsync(userId, dto);
        return Ok(ApiResponse<UserDto>.SuccessResult(updated, "Profile updated successfully"));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.ErrorResult("Validation failed"));
        }

        var userId = User.GetUserId();
        await _userService.ChangePasswordAsync(userId, dto);
        return Ok(ApiResponse.SuccessResult("Password changed successfully"));
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeactivateAccount()
    {
        var userId = User.GetUserId();
        await _userService.DeactivateAccountAsync(userId);
        return Ok(ApiResponse.SuccessResult("Account deactivated successfully"));
    }

    [HttpGet("me/lost-items")]
    public async Task<IActionResult> GetMyLostItems([FromQuery] string? status)
    {
        var userId = User.GetUserId();
        var items = await _userService.GetUserLostItemsAsync(userId, status);
        return Ok(ApiResponse<IEnumerable<LostItemResponseDto>>.SuccessResult(items));
    }

    [HttpGet("me/found-items")]
    public async Task<IActionResult> GetMyFoundItems([FromQuery] string? status)
    {
        var userId = User.GetUserId();
        var items = await _userService.GetUserFoundItemsAsync(userId, status);
        return Ok(ApiResponse<IEnumerable<FoundItemResponseDto>>.SuccessResult(items));
    }
}
