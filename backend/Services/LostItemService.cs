using backend.Data;
using backend.DTOs;
using backend.DTOs.Common;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class LostItemService : ILostItemService
{
    private readonly AppDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<LostItemService> _logger;

    public LostItemService(
        AppDbContext context,
        ICloudinaryService cloudinaryService,
        INotificationService notificationService,
        ILogger<LostItemService> logger)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<LostItemResponseDto> CreateLostItemAsync(CreateLostItemDto dto, Guid userId, List<IFormFile>? imageFiles = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        var lostItem = new LostItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            Location = dto.Location.Trim(),
            DateLost = dto.DateLost.Kind == DateTimeKind.Utc ? dto.DateLost : DateTime.SpecifyKind(dto.DateLost, DateTimeKind.Utc),
            TimeLost = dto.TimeLost?.Trim(),
            AdditionalInformation = dto.AdditionalInformation?.Trim(),
            Reward = dto.Reward?.Trim(),
            Urgency = string.IsNullOrEmpty(dto.Urgency) ? "Medium" : dto.Urgency,
            Status = "Lost",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.LostItems.Add(lostItem);

        // Process uploaded image files via Cloudinary
        if (imageFiles != null && imageFiles.Count > 0)
        {
            var isPrimary = true;
            foreach (var file in imageFiles)
            {
                var (imageUrl, publicId) = await _cloudinaryService.UploadImageAsync(file, "campusfind/lost-items");
                lostItem.Images.Add(new ItemImage
                {
                    LostItemId = lostItem.Id,
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
                lostItem.Images.Add(new ItemImage
                {
                    LostItemId = lostItem.Id,
                    ImageUrl = url.Trim(),
                    PublicId = $"url_{Guid.NewGuid()}",
                    IsPrimary = isPrimary,
                    CreatedAt = DateTime.UtcNow
                });
                isPrimary = false;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Lost item created: {ItemId} by User {UserId}", lostItem.Id, userId);

        // Load navigation properties for response
        await _context.Entry(lostItem).Reference(i => i.User).LoadAsync();
        await _context.Entry(lostItem).Collection(i => i.Images).LoadAsync();

        return MapToDto(lostItem);
    }

    public async Task<PagedResult<LostItemResponseDto>> GetLostItemsAsync(ItemQueryParams queryParams)
    {
        var query = _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .AsQueryable();

        // 1. Search across Title, Description, Category, Location
        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var term = queryParams.Search.Trim().ToLower();
            query = query.Where(i => 
                i.Title.ToLower().Contains(term) ||
                i.Description.ToLower().Contains(term) ||
                i.Category.ToLower().Contains(term) ||
                i.Location.ToLower().Contains(term));
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

        // 4. Status filter - exclude Recovered and Closed items from active website listings by default
        if (!string.IsNullOrWhiteSpace(queryParams.Status) && !queryParams.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(i => i.Status.ToLower() == queryParams.Status.Trim().ToLower());
        }
        else
        {
            query = query.Where(i => i.Status.ToLower() != "recovered" && i.Status.ToLower() != "closed");
        }

        // 5. Date range
        if (queryParams.StartDate.HasValue)
        {
            var startUtc = queryParams.StartDate.Value.Kind == DateTimeKind.Utc 
                ? queryParams.StartDate.Value 
                : DateTime.SpecifyKind(queryParams.StartDate.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DateLost >= startUtc);
        }

        if (queryParams.EndDate.HasValue)
        {
            var endUtc = queryParams.EndDate.Value.Kind == DateTimeKind.Utc 
                ? queryParams.EndDate.Value 
                : DateTime.SpecifyKind(queryParams.EndDate.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DateLost <= endUtc);
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

        return new PagedResult<LostItemResponseDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public async Task<LostItemResponseDto> GetLostItemByIdAsync(Guid id)
    {
        var item = await _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Lost item with ID '{id}' was not found.");
        }

        return MapToDto(item);
    }

    public async Task<LostItemResponseDto> UpdateLostItemAsync(
        Guid id, 
        UpdateLostItemDto dto, 
        Guid currentUserId, 
        bool isAdmin, 
        List<IFormFile>? newImageFiles = null)
    {
        var item = await _context.LostItems
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Lost item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this lost item.");
        }

        item.Title = dto.Title.Trim();
        item.Description = dto.Description.Trim();
        item.Category = dto.Category.Trim();
        item.Location = dto.Location.Trim();
        item.DateLost = dto.DateLost.Kind == DateTimeKind.Utc ? dto.DateLost : DateTime.SpecifyKind(dto.DateLost, DateTimeKind.Utc);
        item.TimeLost = dto.TimeLost?.Trim();
        item.AdditionalInformation = dto.AdditionalInformation?.Trim();
        item.Reward = dto.Reward?.Trim();
        item.Urgency = dto.Urgency;
        item.UpdatedAt = DateTime.UtcNow;

        if (newImageFiles != null && newImageFiles.Count > 0)
        {
            foreach (var file in newImageFiles)
            {
                var (imageUrl, publicId) = await _cloudinaryService.UploadImageAsync(file, "campusfind/lost-items");
                item.Images.Add(new ItemImage
                {
                    LostItemId = item.Id,
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
                        LostItemId = item.Id,
                        ImageUrl = url.Trim(),
                        PublicId = $"url_{Guid.NewGuid()}",
                        IsPrimary = item.Images.Count == 0,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Lost item {ItemId} updated by User {UserId}", id, currentUserId);

        return MapToDto(item);
    }

    public async Task<bool> DeleteLostItemAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var item = await _context.LostItems
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Lost item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this lost item.");
        }

        // Delete images from Cloudinary
        foreach (var img in item.Images)
        {
            if (!string.IsNullOrEmpty(img.PublicId) && !img.PublicId.StartsWith("url_"))
            {
                _ = _cloudinaryService.DeleteImageAsync(img.PublicId);
            }
        }

        _context.LostItems.Remove(item);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Lost item {ItemId} deleted by User {UserId}", id, currentUserId);

        return true;
    }

    public async Task<LostItemResponseDto> UpdateStatusAsync(Guid id, string status, Guid currentUserId, bool isAdmin)
    {
        var item = await _context.LostItems
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            throw new KeyNotFoundException($"Lost item with ID '{id}' was not found.");
        }

        if (item.UserId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to update status for this item.");
        }

        item.Status = status;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Lost item {ItemId} status changed to {Status}", id, status);

        if (status.Equals("Recovered", StringComparison.OrdinalIgnoreCase))
        {
            await _notificationService.CreateNotificationAsync(
                item.UserId,
                "ItemRecovered",
                "Item Marked as Recovered",
                $"Your lost item '{item.Title}' has been marked as recovered!",
                lostItemId: item.Id
            );
        }

        return MapToDto(item);
    }

    public static LostItemResponseDto MapToDto(LostItem item) => new()
    {
        Id = item.Id,
        Title = item.Title,
        Description = item.Description,
        Category = item.Category,
        Location = item.Location,
        DateLost = item.DateLost,
        TimeLost = item.TimeLost,
        AdditionalInformation = item.AdditionalInformation,
        Reward = item.Reward,
        Urgency = item.Urgency,
        Status = item.Status,
        UserId = item.UserId,
        ReporterName = item.User?.FullName ?? "Campus Member",
        ReporterEmail = item.User?.Email,
        ReporterPhone = item.User?.PhoneNumber,
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
