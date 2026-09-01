const path = require('path');
const fs = require('fs');

/** Absolute path to uploaded files (same path for multer + express.static). */
const uploadDir = path.isAbsolute(process.env.UPLOAD_DIR || '')
  ? process.env.UPLOAD_DIR
  : path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = uploadDir;
