const multer = require('multer');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('crypto').webcrypto
  ? require('crypto')
  : require('crypto');
const fs = require('fs');

const uploadRoot = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : 'uploads';
const uploadDirs = {
  music: path.join(uploadRoot, 'music'),
  thumbnails: path.join(uploadRoot, 'thumbnails'),
  profiles: path.join(uploadRoot, 'profiles'),
};

// Ensure upload directories exist
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed MIME types
const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/ogg',
  'application/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/webm',
  'audio/flac',
];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Generic UUID-based filename generator
const generateFilename = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
};

// ─── Audio Storage ───────────────────────────────────────────────────────────
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.music),
  filename: (req, file, cb) => cb(null, generateFilename(file)),
});

const audioFilter = (req, file, cb) => {
  if (AUDIO_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid audio format. Only MP3, WAV, and OGG files are allowed.'
      ),
      false
    );
  }
};

// ─── Image Storage ───────────────────────────────────────────────────────────
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.thumbnails),
  filename: (req, file, cb) => cb(null, generateFilename(file)),
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.profiles),
  filename: (req, file, cb) => cb(null, generateFilename(file)),
});

const imageFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid image format. Only JPEG, PNG, and GIF files are allowed.'
      ),
      false
    );
  }
};

// ─── Multer Instances ────────────────────────────────────────────────────────
const MAX_AUDIO = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE = parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024; // 5 MB

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: MAX_AUDIO },
});

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE },
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE },
});

// Music upload: audio + optional thumbnail in one request
const musicUploadFields = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio') cb(null, uploadDirs.music);
      else cb(null, uploadDirs.thumbnails);
    },
    filename: (req, file, cb) => cb(null, generateFilename(file)),
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') return audioFilter(req, file, cb);
    if (file.fieldname === 'thumbnail') return imageFilter(req, file, cb);
    cb(new Error('Unexpected field'), false);
  },
  limits: { fileSize: MAX_AUDIO }, // audio is larger limit
});

// Album create: optional cover + up to 5 audio files in one request
const albumUploadFields = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio_files') cb(null, uploadDirs.music);
      else cb(null, uploadDirs.thumbnails);
    },
    filename: (req, file, cb) => cb(null, generateFilename(file)),
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio_files') return audioFilter(req, file, cb);
    if (file.fieldname === 'cover_image') return imageFilter(req, file, cb);
    cb(new Error('Unexpected field'), false);
  },
  limits: { fileSize: MAX_AUDIO },
});

module.exports = {
  uploadAudio,
  uploadThumbnail,
  uploadProfile,
  musicUploadFields,
  albumUploadFields,
};
