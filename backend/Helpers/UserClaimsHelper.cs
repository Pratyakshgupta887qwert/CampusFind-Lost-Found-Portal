using System.Security.Claims;

namespace backend.Helpers;

public static class UserClaimsHelper
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? principal.FindFirst("sub")?.Value
                      ?? principal.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User is not authenticated or invalid user claim.");
        }

        return userId;
    }

    public static string GetUserEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
    }

    public static string GetUserRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Role)?.Value ?? "User";
    }

    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
        return principal.GetUserRole().Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }
}
