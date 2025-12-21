import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Screenshot detection function
const isScreenshot = (metadata) => {
  // Check for common screenshot indicators
  // Screenshots often have exact pixel dimensions like 1920x1080, 2560x1440, etc.
  // or common phone sizes like 1125x2436 (iPhone X), 1080x1920 (Android)
  const commonScreenshotDimensions = [
    [1920, 1080], [2560, 1440], [3840, 2160], // Desktop
    [1366, 768], [1440, 900], [1600, 900],     // Laptop
    [1125, 2436], [1080, 1920], [2340, 1080], // Phone
  ];
  
  const width = metadata.width;
  const height = metadata.height;
  
  // Check if dimensions match common screenshot sizes
  const isCommonSize = commonScreenshotDimensions.some(
    ([w, h]) => (width === w && height === h) || (width === h && height === w)
  );
  
  // Check for exact pixel dimensions (common in screenshots)
  const isExactRatio = (width % 10 === 0 && height % 10 === 0);
  
  return isCommonSize || (isExactRatio && (width > 800 && height > 600));
};

// Convert image to WebP
const convertToWebP = async (inputPath, outputPath) => {
  try {
    const metadata = await sharp(inputPath).metadata();
    const isScreenshotImage = isScreenshot(metadata);
    
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    // Delete original file
    fs.unlinkSync(inputPath);
    
    return {
      path: outputPath,
      isScreenshot: isScreenshotImage,
      originalPath: inputPath
    };
  } catch (error) {
    throw new Error(`WebP conversion failed: ${error.message}`);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  }
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name for file upload.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Convert to WebP and detect screenshot
      if (req.file) {
        try {
          const webpPath = req.file.path.replace(/\.[^.]+$/, '.webp');
          const conversionResult = await convertToWebP(req.file.path, webpPath);
          
          req.file.path = conversionResult.path;
          req.file.filename = path.basename(conversionResult.path);
          req.file.isScreenshot = conversionResult.isScreenshot;
          req.file.originalname = path.basename(conversionResult.path);
          req.file.mimetype = 'image/webp';
        } catch (conversionError) {
          console.error('WebP conversion error:', conversionError);
          return res.status(400).json({
            success: false,
            message: conversionError.message
          });
        }
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files.`
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name for file upload.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for mixed file uploads (different field names)
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Clean up uploaded files (utility function)
export const cleanupFiles = (files) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

export default upload;