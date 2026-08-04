const { Album, Music, User } = require('../models');
const { deleteFile, toUploadUrl } = require('../utils/fileUtils');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { sanitizeText } = require('../utils/sanitize');

const parseTrackIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(Number).filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
  } catch {
    return String(value)
      .split(',')
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }

  return [];
};

const cleanAudioTitle = (filename) => {
  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  return sanitizeText(withoutExtension.replace(/[-_]+/g, ' ')).slice(0, 200) || 'Untitled track';
};

const cleanupAlbumFiles = (req) => {
  if (req.file) deleteFile(req.file.path);
  if (!req.files) return;

  Object.values(req.files).flat().forEach((file) => {
    if (file?.path) deleteFile(file.path);
  });
};

// ─── Get All Albums ───────────────────────────────────────────────────────────
const getAllAlbums = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows } = await Album.findAndCountAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // Attach track count
    const data = await Promise.all(
      rows.map(async (album) => {
        const trackCount = await Music.count({ where: { album_id: album.id } });
        return { ...album.toJSON(), trackCount };
      })
    );

    return res.status(200).json({ data, meta: getPaginationMeta(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

// ─── Get Album by ID ──────────────────────────────────────────────────────────
const getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
        { model: Music, as: 'tracks', order: [['createdAt', 'ASC']] },
      ],
    });
    if (!album) {
      return res.status(404).json({ error: 'Album not found.', field: null });
    }
    return res.status(200).json({ data: album });
  } catch (error) {
    next(error);
  }
};

// ─── Get Albums by Author ─────────────────────────────────────────────────────
const getAlbumsByAuthor = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows } = await Album.findAndCountAll({
      where: { author_id: authorId },
      order: [['release_date', 'DESC']],
      limit,
      offset,
    });

    const data = await Promise.all(
      rows.map(async (album) => {
        const trackCount = await Music.count({ where: { album_id: album.id } });
        return { ...album.toJSON(), trackCount };
      })
    );

    return res.status(200).json({ data, meta: getPaginationMeta(count, page, limit) });
  } catch (error) {
    next(error);
  }
}; 

// ─── Create Album ─────────────────────────────────────────────────────────────
const createAlbum = async (req, res, next) => {
  try {
    const { title, description, release_date, track_ids } = req.body;
    const coverFile = req.files?.cover_image?.[0] || req.file || null;
    const audioFiles = req.files?.audio_files || [];
    const coverPath = coverFile ? toUploadUrl(coverFile.path) : null;
    const selectedTrackIds = [...new Set(parseTrackIds(track_ids))];
    const totalTracks = selectedTrackIds.length + audioFiles.length;

    if (audioFiles.length > 5 || totalTracks > 5) {
      cleanupAlbumFiles(req);
      return res.status(400).json({ error: 'You can add a maximum of 5 tracks to an album.', field: 'track_ids' });
    }

    if (selectedTrackIds.length) {
      const ownedTrackCount = await Music.count({
        where: { id: selectedTrackIds, author_id: req.user.id },
      });

      if (ownedTrackCount !== selectedTrackIds.length) {
        cleanupAlbumFiles(req);
        return res.status(400).json({ error: 'One or more selected tracks do not belong to you.', field: 'track_ids' });
      }
    }

    const album = await Album.create({
      author_id: req.user.id,
      title: sanitizeText(title),
      description: description ? sanitizeText(description) : null,
      cover_image: coverPath,
      release_date: release_date || null,
    });

    if (selectedTrackIds.length) {
      await Music.update({ album_id: album.id }, { where: { id: selectedTrackIds, author_id: req.user.id } });
    }

    if (audioFiles.length) {
      await Music.bulkCreate(
        audioFiles.map((file) => ({
          author_id: req.user.id,
          album_id: album.id,
          title: cleanAudioTitle(file.originalname),
          description: description ? sanitizeText(description) : null,
          audio_file_url: toUploadUrl(file.path),
        }))
      );
    }

    const albumWithTracks = await Album.findByPk(album.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
        { model: Music, as: 'tracks' },
      ],
    });

    return res.status(201).json({ data: albumWithTracks });
  } catch (error) {
    cleanupAlbumFiles(req);
    next(error);
  }
};

// ─── Update Album ─────────────────────────────────────────────────────────────
const updateAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found.', field: null });
    if (album.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this album.', field: null });
    }

    const { title, description, release_date } = req.body;
    if (title) album.title = sanitizeText(title);
    if (description !== undefined) album.description = sanitizeText(description);
    if (release_date !== undefined) album.release_date = release_date || null;

    if (req.file) {
      if (album.cover_image) deleteFile(album.cover_image);
      album.cover_image = toUploadUrl(req.file.path);
    }

    await album.save();
    return res.status(200).json({ data: album });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

// ─── Delete Album ─────────────────────────────────────────────────────────────
const deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found.', field: null });
    if (album.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this album.', field: null });
    }

    // Nullify album_id on all tracks in this album
    await Music.update({ album_id: null }, { where: { album_id: album.id } });

    if (album.cover_image) deleteFile(album.cover_image);
    await album.destroy();

    return res.status(200).json({ data: { message: 'Album deleted successfully.' } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  getAlbumsByAuthor,
  createAlbum,
  updateAlbum,
  deleteAlbum,
};
