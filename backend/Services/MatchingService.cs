using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class MatchingService : IMatchingService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<MatchingService> _logger;

    public MatchingService(
        AppDbContext context, 
        INotificationService notificationService, 
        ILogger<MatchingService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<IEnumerable<MatchResponseDto>> GetAllMatchesAsync(int minConfidence = 50)
    {
        var activeLost = await _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.Status == "Lost" || i.Status == "PotentialMatch")
            .ToListAsync();

        var activeFound = await _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.Status == "Found" || i.Status == "PotentialMatch")
            .ToListAsync();

        var matches = new List<MatchResponseDto>();

        foreach (var lost in activeLost)
        {
            foreach (var found in activeFound)
            {
                var (score, reasons) = CalculateMatchScore(lost, found);
                if (score >= minConfidence)
                {
                    matches.Add(new MatchResponseDto
                    {
                        LostItem = LostItemService.MapToDto(lost),
                        FoundItem = FoundItemService.MapToDto(found),
                        ConfidenceScore = score,
                        MatchReasons = reasons
                    });
                }
            }
        }

        return matches.OrderByDescending(m => m.ConfidenceScore);
    }

    public async Task<IEnumerable<MatchResponseDto>> GetMatchesForLostItemAsync(Guid lostItemId, int minConfidence = 50)
    {
        var lost = await _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == lostItemId);

        if (lost == null) return [];

        var activeFound = await _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.Status == "Found" || i.Status == "PotentialMatch")
            .ToListAsync();

        var matches = new List<MatchResponseDto>();

        foreach (var found in activeFound)
        {
            var (score, reasons) = CalculateMatchScore(lost, found);
            if (score >= minConfidence)
            {
                matches.Add(new MatchResponseDto
                {
                    LostItem = LostItemService.MapToDto(lost),
                    FoundItem = FoundItemService.MapToDto(found),
                    ConfidenceScore = score,
                    MatchReasons = reasons
                });
            }
        }

        return matches.OrderByDescending(m => m.ConfidenceScore);
    }

    public async Task<IEnumerable<MatchResponseDto>> GetMatchesForFoundItemAsync(Guid foundItemId, int minConfidence = 50)
    {
        var found = await _context.FoundItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == foundItemId);

        if (found == null) return [];

        var activeLost = await _context.LostItems
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Images)
            .Where(i => i.Status == "Lost" || i.Status == "PotentialMatch")
            .ToListAsync();

        var matches = new List<MatchResponseDto>();

        foreach (var lost in activeLost)
        {
            var (score, reasons) = CalculateMatchScore(lost, found);
            if (score >= minConfidence)
            {
                matches.Add(new MatchResponseDto
                {
                    LostItem = LostItemService.MapToDto(lost),
                    FoundItem = FoundItemService.MapToDto(found),
                    ConfidenceScore = score,
                    MatchReasons = reasons
                });
            }
        }

        return matches.OrderByDescending(m => m.ConfidenceScore);
    }

    public async Task CheckAndNotifyMatchesForLostItemAsync(Guid lostItemId)
    {
        var matches = (await GetMatchesForLostItemAsync(lostItemId, minConfidence: 65)).ToList();
        if (matches.Count == 0) return;

        var topMatch = matches.First();
        var lost = await _context.LostItems.FindAsync(lostItemId);
        if (lost == null) return;

        lost.Status = "PotentialMatch";
        await _context.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            lost.UserId,
            "PotentialMatch",
            "Potential Match Found 🔔",
            $"A found item '{topMatch.FoundItem.Title}' at {topMatch.FoundItem.Location} may match your lost '{lost.Title}' ({topMatch.ConfidenceScore}% confidence).",
            lostItemId: lost.Id,
            foundItemId: topMatch.FoundItem.Id
        );
    }

    public async Task CheckAndNotifyMatchesForFoundItemAsync(Guid foundItemId)
    {
        var matches = (await GetMatchesForFoundItemAsync(foundItemId, minConfidence: 65)).ToList();
        if (matches.Count == 0) return;

        foreach (var match in matches)
        {
            var lost = await _context.LostItems.FindAsync(match.LostItem.Id);
            if (lost != null && lost.Status == "Lost")
            {
                lost.Status = "PotentialMatch";
                await _context.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(
                    lost.UserId,
                    "PotentialMatch",
                    "Potential Match Found 🔔",
                    $"A recently turned in item '{match.FoundItem.Title}' ({match.FoundItem.HoldingLocation}) may match your lost item.",
                    lostItemId: lost.Id,
                    foundItemId: foundItemId
                );
            }
        }
    }

    private static (int Score, List<string> Reasons) CalculateMatchScore(LostItem lost, FoundItem found)
    {
        var score = 0;
        var reasons = new List<string>();

        // 1. Category Match (40 pts)
        if (lost.Category.Equals(found.Category, StringComparison.OrdinalIgnoreCase))
        {
            score += 40;
            reasons.Add($"Matching category: {lost.Category}");
        }

        // 2. Title & Keywords similarity (30 pts)
        var lostWords = GetSignificantWords(lost.Title + " " + lost.Description);
        var foundWords = GetSignificantWords(found.Title + " " + found.Description);
        var commonWords = lostWords.Intersect(foundWords, StringComparer.OrdinalIgnoreCase).ToList();

        if (commonWords.Count > 0)
        {
            var keywordScore = Math.Min(30, commonWords.Count * 10);
            score += keywordScore;
            reasons.Add($"Shared keywords: {string.Join(", ", commonWords.Take(4))}");
        }

        // 3. Location proximity (20 pts)
        var lostLoc = lost.Location.ToLowerInvariant();
        var foundLoc = found.Location.ToLowerInvariant();
        if (lostLoc.Contains(foundLoc) || foundLoc.Contains(lostLoc) ||
            GetSignificantWords(lostLoc).Intersect(GetSignificantWords(foundLoc)).Any())
        {
            score += 20;
            reasons.Add("Similar campus location");
        }

        // 4. Date Proximity (10 pts if found within 14 days of loss)
        var daysDiff = Math.Abs((found.DateFound - lost.DateLost).TotalDays);
        if (daysDiff <= 7)
        {
            score += 10;
            reasons.Add($"Close timeline: reported within {(int)daysDiff} day(s)");
        }
        else if (daysDiff <= 14)
        {
            score += 5;
            reasons.Add($"Reported within {(int)daysDiff} days");
        }

        return (Math.Min(100, score), reasons);
    }

    private static HashSet<string> GetSignificantWords(string text)
    {
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "is", "was", "my", "it", "near", "by", "of"
        };

        var punctuation = text.Where(char.IsPunctuation).Distinct().ToArray();
        var words = text.Split(new[] { ' ', '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(w => w.Trim(punctuation).ToLowerInvariant())
            .Where(w => w.Length > 2 && !stopWords.Contains(w));

        return new HashSet<string>(words, StringComparer.OrdinalIgnoreCase);
    }
}
