const multer = require("multer");

// Use memory storage instead of disk storage
// This avoids filesystem issues on deployment platforms like Render
const storage = multer.memoryStorage();

// File filter to accept both images and videos
const fileFilter = (req, file, cb) => {
  // Check if the file is an image or a video
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file
    cb(new Error('Invalid file type! Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

module.exports = upload;