// src/controllers/userController.js
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res, next) => {
  if (!req.file) {
    next(createHttpError(400, 'No file'));
    return;
  }

  try {
    // 1) Завантажити у Cloudinary
    const result = await saveFileToCloudinary(req.file.buffer);

    // 2) Оновити аватар користувача в БД
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true },
    );

    // 3) Відповідь з URL
    res.status(200).json({ url: user.avatar });
  } catch (err) {
    next(createHttpError(500, 'Failed to upload avatar'));
  }
};
