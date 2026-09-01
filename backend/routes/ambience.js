const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload, uploadAmbienceStory, handleUploadError } = require('../middleware/upload');
const {
  folderValidation,
  storyValidation,
  getAmbience,
  createFolder,
  updateFolder,
  deleteFolder,
  createStory,
  deleteStory,
} = require('../controllers/ambienceController');

router.get('/', getAmbience);

router.post('/folders', authMiddleware, upload.single('image'), folderValidation, createFolder);
router.put('/folders/:id', authMiddleware, upload.single('image'), folderValidation, updateFolder);
router.delete('/folders/:id', authMiddleware, deleteFolder);

router.post(
  '/folders/:folderId/stories',
  authMiddleware,
  uploadAmbienceStory.single('image'),
  storyValidation,
  createStory
);
router.delete('/stories/:id', authMiddleware, deleteStory);

router.use(handleUploadError);

module.exports = router;
