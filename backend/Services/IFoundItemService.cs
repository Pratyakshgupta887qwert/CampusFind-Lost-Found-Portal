using backend.DTOs;
using backend.DTOs.Common;

namespace backend.Services;

public interface IFoundItemService
{
    Task<FoundItemResponseDto> CreateFoundItemAsync(CreateFoundItemDto dto, Guid userId, List<IFormFile>? imageFiles = null);
    Task<PagedResult<FoundItemResponseDto>> GetFoundItemsAsync(ItemQueryParams queryParams);
    Task<FoundItemResponseDto> GetFoundItemByIdAsync(Guid id);
    Task<FoundItemResponseDto> UpdateFoundItemAsync(Guid id, UpdateFoundItemDto dto, Guid currentUserId, bool isAdmin, List<IFormFile>? newImageFiles = null);
    Task<bool> DeleteFoundItemAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<FoundItemResponseDto> UpdateStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin);
}
