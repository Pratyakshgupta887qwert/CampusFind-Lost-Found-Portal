using backend.DTOs;

namespace backend.Services;

public interface IMatchingService
{
    Task<IEnumerable<MatchResponseDto>> GetAllMatchesAsync(int minConfidence = 50);
    Task<IEnumerable<MatchResponseDto>> GetMatchesForLostItemAsync(Guid lostItemId, int minConfidence = 50);
    Task<IEnumerable<MatchResponseDto>> GetMatchesForFoundItemAsync(Guid foundItemId, int minConfidence = 50);
    Task CheckAndNotifyMatchesForLostItemAsync(Guid lostItemId);
    Task CheckAndNotifyMatchesForFoundItemAsync(Guid foundItemId);
}
