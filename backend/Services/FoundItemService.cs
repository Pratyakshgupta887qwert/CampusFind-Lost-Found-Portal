using backend.Data;
using backend.DTOs;
using backend.DTOs.Common;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class FoundItemService : IFoundItemService
{
    private readonly AppDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<FoundItemService> _logger;

    public FoundItemService(
        AppDbContext context,
        ICloudinaryService cloudinaryService,
        INotificationService notificationService,
        ILogger<FoundItemService> logger)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<FoundItemResponseDto> CreateFoundItemAsync(CreateFoundItemDto dto, Guid userId, List<IFormFile>? imageFiles = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        var foundItem = new FoundItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            Location = dto.Location.Trim(),
            DateFound = dto.DateFound.Kind == DateTimeKind.Utc ? dto.DateFound : DateTime.SpecifyKind(dto.DateFound, DateTimeKind.Utc),
            TimeFound = dto.TimeFound?.Trim(),
            AdditionalInformation = dto.AdditionalInformation?.Trim(),
            HoldingLocation = dto.HoldingLocation?.Trim() ?? "Campus Safety HQ",
            VerificationHint = dto.VerificationHint?.Trim(),
            Status = "Found",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.FoundItems.Add(foundItem);

        // Upload images to Cloudinary
        if (imageFiles != null && imageFiles.Count > 0)
        {
            var isPrimary = true;
            foreach (var file in imageFiles)
            {
                var (imageUrl, publicId) = await _cloudinaryService.UploadImageAsync(file, "campusfind/found-items");
                foundItem.Images.Add(new ItemImage
                {
                    FoundItemId = foundItem.Id,
                    ImageUrl = imageUrl,
                    PublicId = publicId,
                    IsPrimary = isPrimary,
                    CreatedAt = DateTime.UtcNow
                });
                isPrimary = false;
            }
        }
        else if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            var isPrimary = true;
            foreach (var url in dto.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)))
            {
                foundItem.Images.Add(new ItemImage
                {
                    FoundItemId = foundItem.Id,
                    ImageUrl = url.Trim(),
                    PublicId = $"url_{Guid.NewGuid()}",
                    IsPrimary = isPrimary,
                    CreatedAt = DateTime.UtcNow
                });
                isPrimary = false;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Found item logged: {ItemId} by User {UserId}", foundItem.Id, userId);

        await _context.Entry(foundItem).Reference(i => i.User).LoadAsync();
        await _context.Entry(foundItem).Collection(i => i.Images).LoadAsync();

        return MapToDto(foundItem);
    }

    public async Task<PagedResult<FoundItemResponseDto>> GetFoundItemsAsync(ItemQueryParams queryParams)
    {
        var query = _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .AsQueryable();

        // 1. Search
        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var term = queryParams.Search.Trim().ToLower();
            query = query.Where(i =>
                i.Title.ToLower().Contains(term) ||
                i.Description.ToLower().Contains(term) ||
                i.Category.ToLower().Contains(term) ||
                i.Location.ToLower().Contains(term) ||
                (i.HoldingLocation != null && i.HoldingLocation.ToLower().Contains(term)));
        }

        // 2. Category filter
        if (!string.IsNullOrWhiteSpace(queryParams.Category) && !queryParams.Category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(i => i.Category.ToLower() == queryParams.Category.Trim().ToLower());
        }

        // 3. Location filter
        if (!string.IsNullOrWhiteSpace(queryParams.Location) && !queryParams.Location.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(i => i.Location.ToLower().Contains(queryParams.Location.Trim().ToLower()));
        }

        // 4. Status filter
        if (!string.IsNullOrWhiteSpace(queryParams.Status) && !queryParams.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(i => i.Status.ToLower() == queryParams.Status.Trim().ToLower());
        }

        // 5. Date range
        if (queryParams.StartDate.HasValue)
        {
            var startUtc = queryParams.StartDate.Value.Kind == DateTimeKind.Utc 
                ? queryParams.StartDate.Value 
                : DateTime.SpecifyKind(queryParams.StartDate.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DateFound >= startUtc);
        }

        if (queryParams.EndDate.HasValue)
        {
            var endUtc = queryParams.EndDate.Value.Kind == DateTimeKind.Utc 
                ? queryParams.EndDate.Value 
                : DateTime.SpecifyKind(queryParams.EndDate.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DateFound <= endUtc);
        }

        // 6. Sorting
        query = (queryParams.Sort?.ToLower()) switch
        {
            "oldest" => query.OrderBy(i => i.CreatedAt),
            "updated" => query.OrderByDescending(i => i.UpdatedAt ?? i.CreatedAt),
            _ => query.OrderByDescending(i => i.CreatedAt)
        };

        var totalItems = await query.CountAsync();
        var page = queryParams.Page > 0 ? queryParams.Page : 1;
        var pageSize = queryParams.PageSize > 0 ? queryParams.PageSize : 20;

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<FoundItemResponseDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public async Task<FoundItemResponseDto> GetFoundItemByIdAsync(Guid id)
    {
        var item = await _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Found item with ID '{id}' was not found.");
        }

        return MapToDto(item);
    }

    public async Task<FoundItemResponseDto> UpdateFoundItemAsync(
        Guid id, 
        UpdateFoundItemDto dto, 
        Guid currentUserId, 
        bool isAdmin, 
        List<IFormFile>? newImageFiles = null)
    {
        var item = await _context.FoundItems
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Found item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this found item.");
        }

        item.Title = dto.Title.Trim();
        item.Description = dto.Description.Trim();
        item.Category = dto.Category.Trim();
        item.Location = dto.Location.Trim();
        item.DateFound = dto.DateFound.Kind == DateTimeKind.Utc ? dto.DateFound : DateTime.SpecifyKind(dto.DateFound, DateTimeKind.Utc);
        item.TimeFound = dto.TimeFound?.Trim();
        item.AdditionalInformation = dto.AdditionalInformation?.Trim();
        item.HoldingLocation = dto.HoldingLocation?.Trim();
        item.VerificationHint = dto.VerificationHint?.Trim();
        item.UpdatedAt = DateTime.UtcNow;

        if (newImageFiles != null && newImageFiles.Count > 0)
        {
            foreach (var file in newImageFiles)
            {
                var (imageUrl, publicId) = await _cloudinaryService.UploadImageAsync(file, "campusfind/found-items");
                item.Images.Add(new ItemImage
                {
                    FoundItemId = item.Id,
                    ImageUrl = imageUrl,
                    PublicId = publicId,
                    IsPrimary = item.Images.Count == 0,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        else if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            foreach (var url in dto.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)))
            {
                if (!item.Images.Any(img => img.ImageUrl == url))
                {
                    item.Images.Add(new ItemImage
                    {
                        FoundItemId = item.Id,
                        ImageUrl = url.Trim(),
                        PublicId = $"url_{Guid.NewGuid()}",
                        IsPrimary = item.Images.Count == 0,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Found item {ItemId} updated by User {UserId}", id, currentUserId);

        return MapToDto(item);
    }

    public async Task<bool> DeleteFoundItemAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var item = await _context.FoundItems
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Found item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this found item.");
        }

        foreach (var img in item.Images)
        {
            if (!string.IsNullOrEmpty(img.PublicId) && !img.PublicId.StartsWith("url_"))
            {
                _ = _cloudinaryService.DeleteImageAsync(img.PublicId);
            }
        }

        _context.FoundItems.Remove(item);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Found item {ItemId} deleted by User {UserId}", id, currentUserId);

        return true;
    }

    public async Task<FoundItemResponseDto> UpdateStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin)
    {
        var item = await _context.FoundItems
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Found item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to update status for this item.");
        }

        item.Status = status;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Found item {ItemId} status changed to {Status}", id, status);

        if (status.Equals("Returned", StringComparison.OrdinalIgnoreCase))
        {
            await _notificationService.CreateNotificationAsync(
                item.UserId,
                "ItemRecovered",
                "Found Property Returned",
                $"The found item '{item.Title}' has been successfully returned to its rightful owner. Thank you!",
                foundItemId: item.Id
            );
        }

        return MapToDto(item);
    }

    public static FoundItemResponseDto MapToDto(FoundItem item) => new()
    {
        Id = item.Id,
        Title = item.Title,
        Description = item.Description,
        Category = item.Category,
        Location = item.Location,
        DateFound = item.DateFound,
        TimeFound = item.TimeFound,
        AdditionalInformation = item.AdditionalInformation,
        HoldingLocation = item.HoldingLocation,
        VerificationHint = item.VerificationHint,
        Status = item.Status,
        UserId = item.UserId,
        FinderName = item.User?.FullName ?? "Campus Member",
        FinderEmail = item.User?.Email,
        FinderPhone = item.User?.PhoneNumber,
        CreatedAt = item.CreatedAt,
        UpdatedAt = item.UpdatedAt,
        Images = item.Images.Select(img => new ItemImageDto
        {
            Id = img.Id,
            ImageUrl = img.ImageUrl,
            PublicId = img.PublicId,
            IsPrimary = img.IsPrimary
        }).ToList()
    };
}
