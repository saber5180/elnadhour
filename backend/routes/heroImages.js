const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  getHeroImages,
  createHeroImage,
  deleteHeroImage,
} = require('../controllers/heroImagesController');

router.get('/', getHeroImages);
router.post('/', authMiddleware, upload.single('image'), createHeroImage);
router.delete('/:id', authMiddleware, deleteHeroImage);
router.use(handleUploadError);

module.exports = router;
