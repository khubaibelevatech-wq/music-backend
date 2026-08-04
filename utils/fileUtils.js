const fs = require('fs');
const os = require('os');
const path = require('path');

const publicUploadRoot = 'uploads';
const runtimeUploadRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), publicUploadRoot)
  : publicUploadRoot;

const normalizeSlashes = (filePath) => filePath.replace(/\\/g, '/');

const toUploadUrl = (filePath) => {
  if (!filePath) return null;

  const normalized = normalizeSlashes(filePath);
  const publicIndex = normalized.lastIndexOf(`${publicUploadRoot}/`);

  if (publicIndex >= 0) {
    return normalized.slice(publicIndex);
  }

  return normalized;
};

const resolveStoredUploadPath = (filePath) => {
  if (!filePath) return null;
  const normalized = normalizeSlashes(filePath);

  if (process.env.VERCEL && normalized.startsWith(`${publicUploadRoot}/`)) {
    return path.join(runtimeUploadRoot, normalized.slice(publicUploadRoot.length + 1));
  }

  return filePath;
};

/**
 * Delete a file from disk safely (no error if not found).
 */
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const fullPath = path.resolve(resolveStoredUploadPath(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err.message);
  }
};

module.exports = { deleteFile, runtimeUploadRoot, toUploadUrl };
