using backend.DTOs;
using backend.DTOs.Common;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchingService _matchingService;

    public MatchesController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMatches([FromQuery] int minConfidence = 50)
    {
        var matches = await _matchingService.GetAllMatchesAsync(minConfidence);
        return Ok(ApiResponse<IEnumerable<MatchResponseDto>>.SuccessResult(matches));
    }
}
