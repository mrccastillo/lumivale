import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

type CloudinaryResourceType = "image" | "video";

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  cloudinary.config({
    api_key: apiKey,
    api_secret: apiSecret,
    cloud_name: cloudName,
    secure: true,
  });
  isConfigured = true;
}

export async function uploadMediaToCloudinary(
  file: File,
  {
    folder,
    resourceType,
  }: {
    folder: string;
    resourceType: CloudinaryResourceType;
  },
) {
  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const options: UploadApiOptions = {
    folder,
    resource_type: resourceType,
    unique_filename: true,
    use_filename: true,
  };

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result?: UploadApiResponse) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a secure URL."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}
