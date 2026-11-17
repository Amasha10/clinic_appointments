const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (request, file, callback) => {
    callback(null, `${randomUUID()}${extensions[file.mimetype] || ''}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (request, file, callback) => {
    if (!extensions[file.mimetype]) {
      const error = new Error('Upload a JPG, PNG, or WebP image.');
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});