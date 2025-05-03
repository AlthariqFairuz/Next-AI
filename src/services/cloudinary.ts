// src/services/cloudinary.ts
import { env } from 'process';

const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
  uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
};

export const cloudinaryUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url;
};

export const getPdfUrl = (cloudinaryId: string): string => {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/raw/upload/${cloudinaryId}`;
};

const cloudinaryService = { cloudinaryUpload, getPdfUrl };
export default cloudinaryService;
