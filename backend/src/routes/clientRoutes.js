const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Client routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', authorize('admin', 'manager'), clientController.createClient);
router.put('/:id', authorize('admin', 'manager'), clientController.updateClient);
router.delete('/:id', authorize('admin'), clientController.deleteClient);

// Warehouse routes
router.post('/:id/warehouses', authorize('admin', 'manager'), clientController.addWarehouse);
router.put('/:id/warehouses/:warehouseId', authorize('admin', 'manager'), clientController.updateWarehouse);

// Location routes
router.post('/:id/warehouses/:warehouseId/locations', authorize('admin', 'manager'), clientController.addLocation);
router.post('/:id/warehouses/:warehouseId/locations/import', authorize('admin', 'manager'), clientController.importLocations);

// Utility routes
router.get('/:id/hierarchy-path', clientController.getHierarchyPath);

module.exports = router;
