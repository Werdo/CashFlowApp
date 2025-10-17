const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Article routes
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticle);
router.post('/', authorize('admin', 'manager'), articleController.createArticle);
router.put('/:id', authorize('admin', 'manager'), articleController.updateArticle);
router.delete('/:id', authorize('admin'), articleController.deleteArticle);

// Family routes
router.get('/families', articleController.getFamilies);
router.post('/families', authorize('admin', 'manager'), articleController.createFamily);

module.exports = router;
