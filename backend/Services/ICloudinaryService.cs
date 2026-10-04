namespace backend.Services;

public interface ICloudinaryService
{
    Task<(string ImageUrl, string PublicId)> UploadImageAsync(IFormFile file, string folder = "campusfind/items");
    Task<bool> DeleteImageAsync(string publicId);
}
