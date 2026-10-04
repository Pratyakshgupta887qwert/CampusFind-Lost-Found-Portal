using backend.DTOs;

namespace backend.Services;

public interface IUserService
{
    Task<UserDto> GetProfileAsync(Guid userId);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<bool> DeactivateAccountAsync(Guid userId);
    Task<IEnumerable<LostItemResponseDto>> GetUserLostItemsAsync(Guid userId, string? status = null);
    Task<IEnumerable<FoundItemResponseDto>> GetUserFoundItemsAsync(Guid userId, string? status = null);
}
