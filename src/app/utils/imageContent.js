import fs from 'fs';
import path from 'path';
import { CONTENT_FILE_PATH } from '../../constants/uploadPath';

// Full path to the content file
const FULL_CONTENT_PATH = path.join(process.cwd(), CONTENT_FILE_PATH);

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(FULL_CONTENT_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize content file if it doesn't exist
const initializeContentFile = () => {
  ensureDataDirectory();
  if (!fs.existsSync(FULL_CONTENT_PATH)) {
    const initialData = {
      images: [],
      lastUpdated: new Date().toISOString(),
      totalImages: 0
    };
    fs.writeFileSync(FULL_CONTENT_PATH, JSON.stringify(initialData, null, 2));
  }
};

// Read all uploaded images from content file
export const getUploadedImages = () => {
  try {
    initializeContentFile();
    const data = fs.readFileSync(FULL_CONTENT_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading uploaded images:', error);
    return { images: [], lastUpdated: new Date().toISOString(), totalImages: 0 };
  }
};

// Add new image to content file
export const addImageToContent = (imageData) => {
  try {
    const content = getUploadedImages();
    const newImage = {
      id: Date.now().toString(),
      filename: imageData.filename,
      originalName: imageData.originalName,
      s3Key: imageData.s3Key,
      s3Url: imageData.s3Url,
      uploadType: imageData.uploadType,
      uploadPath: imageData.uploadPath,
      size: imageData.size,
      mimeType: imageData.mimeType,
      uploadedAt: new Date().toISOString()
    };

    content.images.push(newImage);
    content.totalImages = content.images.length;
    content.lastUpdated = new Date().toISOString();

    fs.writeFileSync(FULL_CONTENT_PATH, JSON.stringify(content, null, 2));
    return newImage;
  } catch (error) {
    console.error('Error adding image to content:', error);
    throw error;
  }
};