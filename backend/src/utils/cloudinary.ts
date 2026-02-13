import { cloudinary } from '../config/cloudinary';
import ApiError from './ApiError';
import streamifier from 'streamifier';

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// Upload image to Cloudinary from buffer
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'prepx'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, 'Failed to upload image to Cloudinary'));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(500, 'Failed to delete image from Cloudinary');
  }
};
