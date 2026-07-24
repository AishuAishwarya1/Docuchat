const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const protect = require('../middleware/authMiddleware');
const { uploadDocument, getDocuments } = require('../controllers/documentController');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, async (req, res, next) => {
  try {
    const document = await require('../models/Document')
      .findOne({ _id: req.params.id, user: req.user._id })
      .select('-extractedText -chunks.text -chunks.embedding');

    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.status(200).json(document);
  } catch (err) {
    next(err);
  }
});

module.exports = router;