const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const hasCloudinaryTuple = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);
const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL);
const hasCloudinaryConfig = hasCloudinaryTuple || hasCloudinaryUrl;

function parseCloudinaryUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    if (u.protocol !== 'cloudinary:') return null;
    const cloudName = (u.hostname || '').trim();
    const apiKey = decodeURIComponent((u.username || '').trim());
    const apiSecret = decodeURIComponent((u.password || '').trim());
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch (_) {
    return null;
  }
}

if (hasCloudinaryConfig) {
  if (hasCloudinaryTuple) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  } else {
    // Supports a single env var format:
    // CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
    const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    if (parsed) {
      cloudinary.config({
        cloud_name: parsed.cloudName,
        api_key: parsed.apiKey,
        api_secret: parsed.apiSecret,
        secure: true,
      });
    } else {
      // Keep running with local uploads if URL is malformed.
      console.error('Invalid CLOUDINARY_URL format. Falling back to local /uploads.');
    }
  }
}

function localUploadPath(file) {
  if (!file?.filename) return null;
  return `/uploads/${file.filename}`;
}

async function uploadImageAndGetUrl(file, folder = 'elnadhour') {
  return uploadMediaAndGetUrl(file, folder, 'image');
}

async function uploadMediaAndGetUrl(file, folder = 'elnadhour', resourceType = null) {
  if (!file) return null;

  const isVideo =
    resourceType === 'video' ||
    (!resourceType && file.mimetype && file.mimetype.startsWith('video/'));
  const type = isVideo ? 'video' : 'image';

  if (!hasCloudinaryConfig) {
    return localUploadPath(file);
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: type,
    });

    try {
      fs.unlinkSync(file.path);
    } catch (_) {
      // Ignore cleanup failures.
    }

    return result.secure_url || result.url || localUploadPath(file);
  } catch (error) {
    console.error('Cloudinary upload failed. Falling back to local upload.', error?.message || error);
    return localUploadPath(file);
  }
}

module.exports = {
  hasCloudinaryConfig,
  uploadImageAndGetUrl,
  uploadMediaAndGetUrl,
  localUploadPath,
};
