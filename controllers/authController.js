const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const { deleteFile, toUploadUrl } = require('../utils/fileUtils');

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, user_type, bio } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use.', field: 'email' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken.', field: 'username' });
    }

    const user = await User.create({
      username,
      email,
      password,
      full_name,
      user_type: user_type || 'user',
      bio: bio || null,
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.', field: null });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.', field: null });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  return res.status(200).json({ data: { message: 'Logged out successfully.' } });
};

// ─── Get Profile ─────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({ data: req.user });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, bio, email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        // Remove uploaded profile pic if email conflict
        if (req.file) deleteFile(req.file.path);
        return res.status(409).json({ error: 'Email already in use by another account.', field: 'email' });
      }
      user.email = email;
    }

    if (full_name) user.full_name = full_name;
    if (bio !== undefined) user.bio = bio;
    if (password) user.password = password; // will be hashed by beforeUpdate hook

    if (req.file) {
      // Delete old profile picture
      if (user.profile_picture) deleteFile(user.profile_picture);
      user.profile_picture = toUploadUrl(req.file.path);
    }

    await user.save();

    return res.status(200).json({ data: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// ─── Get Author Public Profile ────────────────────────────────────────────────
const getAuthorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await User.findOne({
      where: { id, user_type: 'author' },
      attributes: { exclude: ['password'] },
    });
    if (!author) {
      return res.status(404).json({ error: 'Author not found.', field: null });
    }
    return res.status(200).json({ data: author });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, getAuthorProfile };
