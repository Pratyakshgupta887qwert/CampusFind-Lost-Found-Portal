# ================================
# Build Stage
# ================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project file
COPY *.csproj ./

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build and publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false


# ================================
# Runtime Stage
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Render provides the PORT environment variable.
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}

# Start application
ENTRYPOINT ["dotnet", "backend.dll"]