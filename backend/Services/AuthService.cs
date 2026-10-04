using backend.Data;
using backend.DTOs;
using backend.Helpers;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext context, JwtHelper jwtHelper, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

        if (existingUser)
        {
            _logger.LogWarning("Registration failed: Email {Email} already exists", dto.Email);
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = dto.Password,
            PhoneNumber = dto.PhoneNumber?.Trim(),
            StudentOrStaffId = dto.StudentOrStaffId?.Trim(),
            Department = dto.Department?.Trim(),
            Role = !string.IsNullOrEmpty(dto.Role) && dto.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase) 
                ? "Admin" 
                : "User",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New user registered successfully: {Email} (Role: {Role})", user.Email, user.Role);

        var (token, expiration) = _jwtHelper.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Expiration = expiration,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            _logger.LogWarning("Failed login attempt for email: {Email}", dto.Email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        bool passwordMatches = user.PasswordHash == dto.Password;
        if (!passwordMatches)
        {
            try
            {
                passwordMatches = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            }
            catch
            {
                passwordMatches = false;
            }
        }

        if (!passwordMatches)
        {
            _logger.LogWarning("Failed login attempt for email: {Email}", dto.Email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Inactive user attempted login: {Email}", dto.Email);
            throw new UnauthorizedAccessException("Your account has been deactivated. Please contact campus administration.");
        }

        _logger.LogInformation("User logged in successfully: {Email}", user.Email);

        var (token, expiration) = _jwtHelper.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Expiration = expiration,
            User = MapToUserDto(user)
        };
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User profile not found.");
        }

        return MapToUserDto(user);
    }

    public static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        ProfileImageUrl = user.ProfileImageUrl,
        PhoneNumber = user.PhoneNumber,
        StudentOrStaffId = user.StudentOrStaffId,
        Department = user.Department,
        Role = user.Role,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
