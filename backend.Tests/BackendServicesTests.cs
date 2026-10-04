using backend.Data;
using backend.DTOs;
using backend.DTOs.Common;
using backend.Helpers;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Tests;

public class BackendServicesTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "Test_Super_Secret_Key_For_Unit_Tests_2026_Minimum_32_Chars!"},
            {"Jwt:Issuer", "TestCampusFind"},
            {"Jwt:Audience", "TestCampusFindClient"},
            {"Jwt:ExpiryHours", "24"}
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    private class MockHubContext : IHubContext<NotificationHub>
    {
        public IHubClients Clients => new MockHubClients();
        public IGroupManager Groups => new MockGroupManager();
    }

    private class MockHubClients : IHubClients
    {
        public IClientProxy All => new MockClientProxy();
        public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => new MockClientProxy();
        public IClientProxy Client(string connectionId) => new MockClientProxy();
        public IClientProxy Clients(IReadOnlyList<string> connectionIds) => new MockClientProxy();
        public IClientProxy Group(string groupName) => new MockClientProxy();
        public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => new MockClientProxy();
        public IClientProxy Groups(IReadOnlyList<string> groupNames) => new MockClientProxy();
        public IClientProxy User(string userId) => new MockClientProxy();
        public IClientProxy Users(IReadOnlyList<string> userIds) => new MockClientProxy();
    }

    private class MockClientProxy : IClientProxy
    {
        public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private class MockGroupManager : IGroupManager
    {
        public Task AddToGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task RemoveFromGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    [Fact]
    public async Task AuthService_RegisterAndLogin_ShouldSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var jwtHelper = new JwtHelper(config);
        var authService = new AuthService(context, jwtHelper, NullLogger<AuthService>.Instance);

        var registerDto = new RegisterDto
        {
            FullName = "Jane Doe",
            Email = "jane.doe@campus.edu",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            StudentOrStaffId = "STU-100200",
            Department = "Computer Science"
        };

        // Act - Register
        var registerResult = await authService.RegisterAsync(registerDto);

        // Assert
        Assert.NotNull(registerResult);
        Assert.False(string.IsNullOrEmpty(registerResult.Token));
        Assert.Equal("jane.doe@campus.edu", registerResult.User.Email);

        // Act - Login
        var loginResult = await authService.LoginAsync(new LoginDto
        {
            Email = "jane.doe@campus.edu",
            Password = "Password123!"
        });

        // Assert
        Assert.NotNull(loginResult);
        Assert.False(string.IsNullOrEmpty(loginResult.Token));
        Assert.Equal(registerResult.User.Id, loginResult.User.Id);
    }

    [Fact]
    public async Task LostItemService_CreateAndRetrieve_ShouldFilterCorrectly()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var cloudinary = new CloudinaryService(config, NullLogger<CloudinaryService>.Instance);
        var hub = new MockHubContext();
        var notificationService = new NotificationService(context, hub, NullLogger<NotificationService>.Instance);
        var lostItemService = new LostItemService(context, cloudinary, notificationService, NullLogger<LostItemService>.Instance);

        var user = new User
        {
            FullName = "Alex Rivera",
            Email = "alex@campus.edu",
            PasswordHash = "hash",
            Role = "User"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act - Create
        var item1 = await lostItemService.CreateLostItemAsync(new CreateLostItemDto
        {
            Title = "Blue Hydro Flask",
            Description = "32oz blue water bottle with stickers",
            Category = "Accessories",
            Location = "Main Library 2nd Floor",
            DateLost = DateTime.UtcNow
        }, user.Id);

        var item2 = await lostItemService.CreateLostItemAsync(new CreateLostItemDto
        {
            Title = "Apple MacBook Air",
            Description = "Silver 13-inch laptop in black sleeve",
            Category = "Electronics",
            Location = "Engineering Quad Lab",
            DateLost = DateTime.UtcNow
        }, user.Id);

        // Act - Query by category
        var queryElectronics = await lostItemService.GetLostItemsAsync(new ItemQueryParams
        {
            Category = "Electronics"
        });

        // Assert
        Assert.Single(queryElectronics.Items);
        Assert.Equal("Apple MacBook Air", queryElectronics.Items.First().Title);

        // Act - Search keyword
        var searchFlask = await lostItemService.GetLostItemsAsync(new ItemQueryParams
        {
            Search = "Hydro"
        });

        Assert.Single(searchFlask.Items);
        Assert.Equal("Blue Hydro Flask", searchFlask.Items.First().Title);
    }

    [Fact]
    public async Task MatchingService_ShouldDetectHighConfidenceMatch()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var hub = new MockHubContext();
        var notificationService = new NotificationService(context, hub, NullLogger<NotificationService>.Instance);
        var matchingService = new MatchingService(context, notificationService, NullLogger<MatchingService>.Instance);

        var owner = new User { FullName = "Owner", Email = "owner@campus.edu", PasswordHash = "x" };
        var finder = new User { FullName = "Finder", Email = "finder@campus.edu", PasswordHash = "x" };
        context.Users.AddRange(owner, finder);
        await context.SaveChangesAsync();

        var lost = new LostItem
        {
            Title = "Black Leather Bellroy Wallet",
            Description = "Contains student ID card and bus pass",
            Category = "Keys & Wallets",
            Location = "University Dining Commons",
            DateLost = DateTime.UtcNow.AddDays(-2),
            UserId = owner.Id,
            Status = "Lost"
        };

        var found = new FoundItem
        {
            Title = "Found Black Leather Wallet",
            Description = "Turned in near Dining Commons tables",
            Category = "Keys & Wallets",
            Location = "University Dining Commons",
            DateFound = DateTime.UtcNow.AddDays(-1),
            HoldingLocation = "Dining Desk",
            UserId = finder.Id,
            Status = "Found"
        };

        context.LostItems.Add(lost);
        context.FoundItems.Add(found);
        await context.SaveChangesAsync();

        // Act
        var matches = (await matchingService.GetMatchesForLostItemAsync(lost.Id)).ToList();

        // Assert
        Assert.NotEmpty(matches);
        var match = matches.First();
        Assert.True(match.ConfidenceScore >= 70, $"Expected confidence >= 70, got {match.ConfidenceScore}");
        Assert.Contains("Matching category", match.MatchReasons.First());
    }

    [Fact]
    public async Task ClaimService_SubmitAndApproveClaim_ShouldUpdateItemStatus()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var hub = new MockHubContext();
        var notificationService = new NotificationService(context, hub, NullLogger<NotificationService>.Instance);
        var claimService = new ClaimService(context, notificationService, NullLogger<ClaimService>.Instance);

        var finder = new User { FullName = "Finder", Email = "finder@campus.edu", PasswordHash = "x" };
        var claimant = new User { FullName = "Claimant", Email = "claimant@campus.edu", PasswordHash = "x" };
        context.Users.AddRange(finder, claimant);
        await context.SaveChangesAsync();

        var found = new FoundItem
        {
            Title = "Sony WH-1000XM5 Headphones",
            Description = "Black headphones found on bench",
            Category = "Electronics",
            Location = "Student Center",
            HoldingLocation = "Student Center Info Desk",
            DateFound = DateTime.UtcNow,
            UserId = finder.Id,
            Status = "Found"
        };
        context.FoundItems.Add(found);
        await context.SaveChangesAsync();

        // Act - Submit Claim
        var claim = await claimService.CreateClaimAsync(new CreateClaimDto
        {
            FoundItemId = found.Id,
            Message = "These are mine! The case has my initials engraved.",
            ProofDetails = "Initials: SK inside headband"
        }, claimant.Id);

        // Assert
        Assert.Equal("Pending", claim.Status);

        // Act - Approve Claim
        var approvedClaim = await claimService.UpdateClaimStatusAsync(claim.Id, "Approved", finder.Id, isAdmin: false);

        // Assert
        Assert.Equal("Approved", approvedClaim.Status);
        var updatedFoundItem = await context.FoundItems.FindAsync(found.Id);
        Assert.Equal("Returned", updatedFoundItem!.Status);
    }
}
