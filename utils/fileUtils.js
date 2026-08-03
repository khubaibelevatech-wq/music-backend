const fs = require('fs');
const path = require('path');

/**
 * Delete a file from disk safely (no error if not found).
 */
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err.message);
  }
};

module.exports = { deleteFile };
