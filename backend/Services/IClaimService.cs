using backend.DTOs;

namespace backend.Services;

public interface IClaimService
{
    Task<ClaimResponseDto> CreateClaimAsync(CreateClaimDto dto, Guid claimantId);
    Task<IEnumerable<ClaimResponseDto>> GetUserClaimsAsync(Guid currentUserId);
    Task<IEnumerable<ClaimResponseDto>> GetItemClaimsAsync(Guid itemId, Guid currentUserId, bool isAdmin);
    Task<ClaimResponseDto> GetClaimByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<ClaimResponseDto> UpdateClaimStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin);
}
