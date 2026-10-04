using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserDto> GetProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return AuthService.MapToUserDto(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        user.FullName = dto.FullName.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.StudentOrStaffId = dto.StudentOrStaffId?.Trim();
        user.Department = dto.Department?.Trim();

        if (!string.IsNullOrEmpty(dto.ProfileImageUrl))
        {
            user.ProfileImageUrl = dto.ProfileImageUrl;
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Profile updated for user {UserId}", userId);

        return AuthService.MapToUserDto(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Password changed successfully for user {UserId}", userId);

        return true;
    }

    public async Task<bool> DeactivateAccountAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Account deactivated for user {UserId}", userId);

        return true;
    }

    public async Task<IEnumerable<LostItemResponseDto>> GetUserLostItemsAsync(Guid userId, string? status = null)
    {
        var query = _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(i => i.Status.ToLower() == status.ToLower());
        }

        var items = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return items.Select(LostItemService.MapToDto);
    }

    public async Task<IEnumerable<FoundItemResponseDto>> GetUserFoundItemsAsync(Guid userId, string? status = null)
    {
        var query = _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(i => i.Status.ToLower() == status.ToLower());
        }

        var items = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return items.Select(FoundItemService.MapToDto);
    }
}
