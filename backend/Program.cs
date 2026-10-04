using System.Text;
using backend.Data;
using backend.Helpers;
using backend.Hubs;
using backend.Middleware;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with JSON configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 2. Configure Database with Entity Framework Core (PostgreSQL with InMemory development fallback)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                       ?? "Host=localhost;Port=5432;Database=campusfind_db;Username=postgres;Password=postgres";

var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useInMemory)
    {
        options.UseInMemoryDatabase("CampusFindDevDb");
    }
    else
    {
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);
        });
    }
});

// 3. Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"]
                ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? "CampusFind_Super_Secure_JWT_Secret_Key_2026_Campus_Portal_Key_12345!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CampusFindApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CampusFindClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Support JWT over SignalR WebSocket queries
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 4. Configure SignalR
builder.Services.AddSignalR();

// 5. Register Application Services (Dependency Injection)
builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ILostItemService, LostItemService>();
builder.Services.AddScoped<IFoundItemService, FoundItemService>();
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<IClaimService, ClaimService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 6. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5024")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 7. Configure OpenAPI / Swagger with JWT Bearer Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CampusFind API — Lost & Found Portal",
        Version = "v1",
        Description = "Centralized campus recovery platform with JWT authentication, Cloudinary storage, SignalR, and automated matching."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
});

var app = builder.Build();

// 8. Global Exception Handling Middleware
app.UseMiddleware<ExceptionMiddleware>();

// 9. HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CampusFind API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseRouting();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

// 10. Database Connection & Seed Data Initialization
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        if (useInMemory)
        {
            await dbContext.Database.EnsureCreatedAsync();
            logger.LogInformation("Using in-memory development database for local testing.");
        }
        else
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            if (canConnect)
            {
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("PostgreSQL database connected and migrations applied successfully.");
            }
            else
            {
                logger.LogWarning("PostgreSQL is offline at: {ConnectionString}. Enable UseInMemoryDatabase in appsettings.Development.json to test offline.", connectionString);
            }
        }

        // Seed initial accounts if empty
        if (!await dbContext.Users.AnyAsync())
        {
            var adminUser = new User
            {
                FullName = "Campus Safety Admin",
                Email = "admin@campus.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@Campus2026!"),
                Role = "Admin",
                StudentOrStaffId = "STAFF-ADM-01",
                Department = "Campus Security HQ",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var studentUser = new User
            {
                FullName = "Alex Rivera",
                Email = "alex.rivera@campus.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@2026!"),
                Role = "User",
                StudentOrStaffId = "STU-992026",
                Department = "Computer Science & Engineering",
                PhoneNumber = "+1 (555) 234-8910",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.Users.AddRange(adminUser, studentUser);
            await dbContext.SaveChangesAsync();

            // Seed initial lost & found items
            var lostItem = new LostItem
            {
                Title = "Space Gray MacBook Pro 14\" (M3)",
                Category = "Electronics",
                Location = "Main Library — 3rd Floor Quiet Study Pods",
                Description = "Left on desk 34 near the window. Has a GitHub Octocat sticker and a Rust programming sticker on the lid.",
                DateLost = DateTime.UtcNow.AddDays(-1),
                TimeLost = "4:30 PM",
                Reward = "$50 Reward",
                Urgency = "High",
                Status = "Lost",
                UserId = studentUser.Id,
                CreatedAt = DateTime.UtcNow
            };

            var foundItem = new FoundItem
            {
                Title = "Found: Hydro Flask 32oz Cobalt Blue Water Bottle",
                Category = "Accessories",
                Location = "Student Union Plaza — Outdoor Wooden Benches",
                Description = "Blue wide-mouth Hydro Flask covered with National Parks and NASA stickers.",
                HoldingLocation = "Student Union Info Desk (Room 101)",
                VerificationHint = "Owner must confirm which specific National Park stickers are on the back side.",
                DateFound = DateTime.UtcNow,
                TimeFound = "12:40 PM",
                Status = "Found",
                UserId = adminUser.Id,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.LostItems.Add(lostItem);
            dbContext.FoundItems.Add(foundItem);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Default seed data initialized (Admin: admin@campus.edu / Student: alex.rivera@campus.edu).");
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning("Database initialization notice: {Message}.", ex.Message);
    }
}

app.Run();