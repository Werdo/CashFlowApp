const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadLogo, handleUploadError } = require('../middleware/upload');

router.use(authenticate);

// Settings routes
router.get('/', settingsController.getSettings);
router.put('/', authorize('admin'), settingsController.updateSettings);

// Specific settings sections
router.put('/theme', settingsController.updateTheme);
router.put('/company', authorize('admin'), settingsController.updateCompany);
router.put('/system', settingsController.updateSystem);
router.put('/integrations', authorize('admin'), settingsController.updateIntegrations);

// Logo management routes
router.post('/logo', authorize('admin'), uploadLogo, handleUploadError, settingsController.uploadLogo);
router.delete('/logo', authorize('admin'), settingsController.deleteLogo);
router.get('/logo', settingsController.getLogo);

module.exports = router;
