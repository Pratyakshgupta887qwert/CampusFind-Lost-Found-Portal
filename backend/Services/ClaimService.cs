using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ClaimService : IClaimService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ClaimService> _logger;

    public ClaimService(
        AppDbContext context, 
        INotificationService notificationService, 
        ILogger<ClaimService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<ClaimResponseDto> CreateClaimAsync(CreateClaimDto dto, Guid claimantId)
    {
        if (!dto.LostItemId.HasValue && !dto.FoundItemId.HasValue)
        {
            throw new ArgumentException("A claim must reference either a Lost Item or a Found Item.");
        }

        var claimant = await _context.Users.FindAsync(claimantId);
        if (claimant == null)
        {
            throw new KeyNotFoundException("Claimant not found.");
        }

        Guid? notifyUserId = null;
        string itemTitle = "Item";

        if (dto.FoundItemId.HasValue)
        {
            var found = await _context.FoundItems.FindAsync(dto.FoundItemId.Value);
            if (found == null) throw new KeyNotFoundException("Found item not found.");
            if (found.UserId == claimantId) throw new InvalidOperationException("You cannot claim an item you reported as found.");
            notifyUserId = found.UserId;
            itemTitle = found.Title;
        }
        else if (dto.LostItemId.HasValue)
        {
            var lost = await _context.LostItems.FindAsync(dto.LostItemId.Value);
            if (lost == null) throw new KeyNotFoundException("Lost item not found.");
            if (lost.UserId == claimantId) throw new InvalidOperationException("You cannot claim your own lost item.");
            notifyUserId = lost.UserId;
            itemTitle = lost.Title;
        }

        var claim = new Claim
        {
            LostItemId = dto.LostItemId,
            FoundItemId = dto.FoundItemId,
            ClaimantId = claimantId,
            Message = dto.Message.Trim(),
            ProofDetails = dto.ProofDetails?.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Claims.Add(claim);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Claim {ClaimId} created by user {ClaimantId}", claim.Id, claimantId);

        // Notify item poster
        if (notifyUserId.HasValue)
        {
            await _notificationService.CreateNotificationAsync(
                notifyUserId.Value,
                "ClaimSubmitted",
                "New Claim Submitted 📝",
                $"{claimant.FullName} submitted an ownership claim on '{itemTitle}'.",
                lostItemId: dto.LostItemId,
                foundItemId: dto.FoundItemId
            );
        }

        await _context.Entry(claim).Reference(c => c.Claimant).LoadAsync();
        if (claim.LostItemId.HasValue) await _context.Entry(claim).Reference(c => c.LostItem).LoadAsync();
        if (claim.FoundItemId.HasValue) await _context.Entry(claim).Reference(c => c.FoundItem).LoadAsync();

        return MapToDto(claim);
    }

    public async Task<IEnumerable<ClaimResponseDto>> GetUserClaimsAsync(Guid currentUserId)
    {
        var claims = await _context.Claims
            .AsNoTracking()
            .Include(c => c.Claimant)
            .Include(c => c.LostItem)
            .Include(c => c.FoundItem)
            .Where(c => c.ClaimantId == currentUserId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return claims.Select(MapToDto);
    }

    public async Task<IEnumerable<ClaimResponseDto>> GetItemClaimsAsync(Guid itemId, Guid currentUserId, bool isAdmin)
    {
        var claims = await _context.Claims
            .AsNoTracking()
            .Include(c => c.Claimant)
            .Include(c => c.LostItem)
            .Include(c => c.FoundItem)
            .Where(c => (c.LostItemId == itemId && (c.LostItem!.UserId == currentUserId || isAdmin)) ||
                        (c.FoundItemId == itemId && (c.FoundItem!.UserId == currentUserId || isAdmin)))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return claims.Select(MapToDto);
    }

    public async Task<ClaimResponseDto> GetClaimByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var claim = await _context.Claims
            .AsNoTracking()
            .Include(c => c.Claimant)
            .Include(c => c.LostItem)
            .Include(c => c.FoundItem)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (claim == null) throw new KeyNotFoundException("Claim not found.");

        var isOwner = (claim.LostItem != null && claim.LostItem.UserId == currentUserId) ||
                      (claim.FoundItem != null && claim.FoundItem.UserId == currentUserId);

        if (claim.ClaimantId != currentUserId && !isOwner && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this claim.");
        }

        return MapToDto(claim);
    }

    public async Task<ClaimResponseDto> UpdateClaimStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin)
    {
        var claim = await _context.Claims
            .Include(c => c.Claimant)
            .Include(c => c.LostItem)
            .Include(c => c.FoundItem)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (claim == null) throw new KeyNotFoundException("Claim not found.");

        var isItemOwner = (claim.LostItem != null && claim.LostItem.UserId == currentUserId) ||
                          (claim.FoundItem != null && claim.FoundItem.UserId == currentUserId);

        if (!isItemOwner && !isAdmin && !(claim.ClaimantId == currentUserId && status == "Cancelled"))
        {
            throw new UnauthorizedAccessException("You are not authorized to update this claim's status.");
        }

        claim.Status = status;
        claim.UpdatedAt = DateTime.UtcNow;

        // If approved, update item status to Recovered / Returned
        if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            if (claim.FoundItem != null) claim.FoundItem.Status = "Returned";
            if (claim.LostItem != null) claim.LostItem.Status = "Recovered";

            await _notificationService.CreateNotificationAsync(
                claim.ClaimantId,
                "ClaimStatusUpdated",
                "Claim Approved! 🎉",
                $"Your claim for '{(claim.FoundItem?.Title ?? claim.LostItem?.Title)}' has been approved. You can arrange collection.",
                lostItemId: claim.LostItemId,
                foundItemId: claim.FoundItemId
            );
        }
        else if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            await _notificationService.CreateNotificationAsync(
                claim.ClaimantId,
                "ClaimStatusUpdated",
                "Claim Status Update",
                $"Your claim for '{(claim.FoundItem?.Title ?? claim.LostItem?.Title)}' was not approved.",
                lostItemId: claim.LostItemId,
                foundItemId: claim.FoundItemId
            );
        }

        await _context.SaveChangesAsync();
        return MapToDto(claim);
    }

    public static ClaimResponseDto MapToDto(Claim c) => new()
    {
        Id = c.Id,
        LostItemId = c.LostItemId,
        LostItemTitle = c.LostItem?.Title,
        FoundItemId = c.FoundItemId,
        FoundItemTitle = c.FoundItem?.Title,
        ClaimantId = c.ClaimantId,
        ClaimantName = c.Claimant?.FullName ?? "Student Claimant",
        ClaimantEmail = c.Claimant?.Email ?? string.Empty,
        ClaimantPhone = c.Claimant?.PhoneNumber,
        Message = c.Message,
        ProofDetails = c.ProofDetails,
        Status = c.Status,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
