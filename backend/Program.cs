using System.Text;

using backend.Data;
using backend.Helpers;
using backend.Hubs;
using backend.Middleware;
using backend.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;

        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });


// ─────────────────────────────────────────────────────────────────────────────
// DATABASE — NEON POSTGRESQL
// ─────────────────────────────────────────────────────────────────────────────

// var connectionString =
//     builder.Configuration.GetConnectionString("DefaultConnection")
//     ?? Environment.GetEnvironmentVariable("DATABASE_URL")
//     ?? throw new InvalidOperationException(
//         "Database connection string is not configured. " +
//         "Set ConnectionStrings:DefaultConnection using .NET User Secrets " +
//         "or set the DATABASE_URL environment variable.");

var connectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. " +
        "Set ConnectionStrings:DefaultConnection using .NET User Secrets " +
        "or set the DATABASE_URL environment variable.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        connectionString,
        npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);
        });
});


// ─────────────────────────────────────────────────────────────────────────────
// JWT AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

var jwtSecret =
    builder.Configuration["Jwt:SecretKey"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException(
        "JWT secret is not configured. " +
        "Set Jwt:SecretKey using .NET User Secrets " +
        "or set the JWT_SECRET environment variable.");

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? "CampusFindApi";

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? "CampusFindClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSecret)),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
});

builder.Services.AddAuthorization();


// ─────────────────────────────────────────────────────────────────────────────
// SIGNALR
// ─────────────────────────────────────────────────────────────────────────────

builder.Services.AddSignalR();


// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

builder.Services.AddSingleton<JwtHelper>();

builder.Services.AddScoped<
    ICloudinaryService,
    CloudinaryService>();

builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

builder.Services.AddScoped<
    IAuthService,
    AuthService>();

builder.Services.AddScoped<
    IUserService,
    UserService>();

builder.Services.AddScoped<
    ILostItemService,
    LostItemService>();

builder.Services.AddScoped<
    IFoundItemService,
    FoundItemService>();

builder.Services.AddScoped<
    IMatchingService,
    MatchingService>();

builder.Services.AddScoped<
    IClaimService,
    ClaimService>();

builder.Services.AddScoped<
    IReportService,
    ReportService>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();


// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "https://campus-find-lost-found-portal.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER
// ─────────────────────────────────────────────────────────────────────────────

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title =
                "CampusFind API — Lost & Found Portal",

            Version = "v1",

            Description =
                "Centralized campus recovery platform with " +
                "JWT authentication, Cloudinary storage, " +
                "SignalR, and automated matching."
        });

    var securityScheme =
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Description =
                "JWT Authorization header using the Bearer scheme.",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "Bearer",

            BearerFormat = "JWT"
        };

    c.AddSecurityDefinition(
        "Bearer",
        securityScheme);

    c.AddSecurityRequirement(doc =>
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer"),
                new List<string>()
            }
        });
});


// ─────────────────────────────────────────────────────────────────────────────
// BUILD APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

var app = builder.Build();


// ─────────────────────────────────────────────────────────────────────────────
// EXCEPTION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

app.UseMiddleware<ExceptionMiddleware>();


// ─────────────────────────────────────────────────────────────────────────────
// SWAGGER
// ─────────────────────────────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "CampusFind API v1");

        c.RoutePrefix = "swagger";
    });
}


// ─────────────────────────────────────────────────────────────────────────────
// HTTP PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

app.UseRouting();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();


// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

app.MapControllers();


// ─────────────────────────────────────────────────────────────────────────────
// SIGNALR HUB
// ─────────────────────────────────────────────────────────────────────────────

app.MapHub<NotificationHub>(
    "/hubs/notifications");


// ─────────────────────────────────────────────────────────────────────────────
// DATABASE INITIALIZATION & MIGRATIONS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE INIT & MIGRATIONS
// ─────────────────────────────────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())
{
    var logger =
        scope.ServiceProvider
            .GetRequiredService<ILogger<Program>>();

    var dbContext =
        scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

    try
    {
        logger.LogInformation(
            "🔄 Connecting to Neon PostgreSQL...");

        await dbContext.Database.OpenConnectionAsync();

        logger.LogInformation(
            "✅ PostgreSQL connection OPENED successfully!");

        await dbContext.Database.CloseConnectionAsync();

        logger.LogInformation(
            "🔄 Applying EF Core migrations...");

        await dbContext.Database.MigrateAsync();

        logger.LogInformation(
            "✅ PostgreSQL migrations applied successfully!");
    }
    catch (Exception ex)
    {
        logger.LogError(
            ex,
            "❌ PostgreSQL ERROR: {Message}",
            ex.Message);
    }
}
app.Run();