import { v2 as cloudinary } from 'cloudinary';

// Check if credentials are set in environment
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads an image URL to Cloudinary and returns the optimized, secure CDN URL.
 * If credentials are not set, the URL is invalid, or the upload fails, returns the original URL.
 */
export async function uploadToCloudinary(imageUrl: string, folder: string = 'epicorn'): Promise<string> {
  // Validate it is a real remote URL
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary API credentials are not configured. Returning original URL:', imageUrl);
    return imageUrl;
  }

  try {
    const response = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return response.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', imageUrl, error);
    return imageUrl;
  }
}
