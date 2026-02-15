import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError';

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only CSV and JSON files are allowed'), false);
  }
};

// Multer config
export const uploadFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
