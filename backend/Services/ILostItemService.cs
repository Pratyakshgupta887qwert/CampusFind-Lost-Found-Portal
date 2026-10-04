using backend.DTOs;
using backend.DTOs.Common;

namespace backend.Services;

public interface ILostItemService
{
    Task<LostItemResponseDto> CreateLostItemAsync(CreateLostItemDto dto, Guid userId, List<IFormFile>? imageFiles = null);
    Task<PagedResult<LostItemResponseDto>> GetLostItemsAsync(ItemQueryParams queryParams);
    Task<LostItemResponseDto> GetLostItemByIdAsync(Guid id);
    Task<LostItemResponseDto> UpdateLostItemAsync(Guid id, UpdateLostItemDto dto, Guid currentUserId, bool isAdmin, List<IFormFile>? newImageFiles = null);
    Task<bool> DeleteLostItemAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<LostItemResponseDto> UpdateStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin);
}
