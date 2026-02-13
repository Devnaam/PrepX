import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Only image files (jpeg, jpg, png, gif, webp) are allowed'),
      false
    );
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

export default upload;
