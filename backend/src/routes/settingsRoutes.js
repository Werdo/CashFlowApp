const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Settings routes
router.get('/', settingsController.getSettings);
router.put('/', authorize('admin'), settingsController.updateSettings);

// Specific settings sections
router.put('/theme', settingsController.updateTheme);
router.put('/company', authorize('admin'), settingsController.updateCompany);
router.put('/system', settingsController.updateSystem);
router.put('/integrations', authorize('admin'), settingsController.updateIntegrations);

module.exports = router;
