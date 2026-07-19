const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const protect = require('../middleware/authMiddleware');
const { uploadDocument, getDocuments } = require('../controllers/documentController');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);

module.exports = router;