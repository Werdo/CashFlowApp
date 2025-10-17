const { Client } = require('../models');

/**
 * Get all clients (with optional hierarchy)
 */
async function getClients(req, res, next) {
  try {
    const { includeTree, parentId, level } = req.query;

    // Return tree structure if requested
    if (includeTree === 'true') {
      const tree = await Client.getClientTree();
      return res.json({
        success: true,
        data: { clients: tree }
      });
    }

    // Build query
    const query = { active: true };
    if (parentId) query.parentClientId = parentId;
    if (level) query.level = parseInt(level);

    const clients = await Client.find(query)
      .populate('parentClientId', 'name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { clients }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single client by ID
 */
async function getClient(req, res, next) {
  try {
    const { id } = req.params;
    const { includeChildren } = req.query;

    const client = await Client.findById(id)
      .populate('parentClientId', 'name code');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Include children if requested
    if (includeChildren === 'true') {
      const children = await Client.find({ parentClientId: id });
      const clientObj = client.toObject();
      clientObj.children = children;
      return res.json({
        success: true,
        data: { client: clientObj }
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new client
 */
async function createClient(req, res, next) {
  try {
    const { code, name, type, level, parentClientId, contactInfo, warehouses, fiscalInfo, notes } = req.body;

    // Validation
    if (!code || !name || !type || !level) {
      return res.status(400).json({
        success: false,
        message: 'Code, name, type, and level are required'
      });
    }

    // Check if code exists
    const existingClient = await Client.findOne({ code });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client code already exists'
      });
    }

    // Create client
    const client = new Client({
      code,
      name,
      type,
      level,
      parentClientId: parentClientId || null,
      contactInfo,
      warehouses: warehouses || [],
      fiscalInfo,
      notes
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update client
 */
async function updateClient(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing code, type, level, or parentClientId
    delete updates.code;
    delete updates.type;
    delete updates.level;
    delete updates.parentClientId;

    const client = await Client.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete client (soft delete)
 */
async function deleteClient(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add warehouse to client
 */
async function addWarehouse(req, res, next) {
  try {
    const { id } = req.params;
    const warehouseData = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    client.warehouses.push(warehouseData);
    await client.save();

    res.json({
      success: true,
      message: 'Warehouse added successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update warehouse
 */
async function updateWarehouse(req, res, next) {
  try {
    const { id, warehouseId } = req.params;
    const updates = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const warehouse = client.warehouses.id(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    Object.assign(warehouse, updates);
    await client.save();

    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add location to warehouse
 */
async function addLocation(req, res, next) {
  try {
    const { id, warehouseId } = req.params;
    const locationData = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const warehouse = client.warehouses.id(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    warehouse.locations.push(locationData);
    await client.save();

    res.json({
      success: true,
      message: 'Location added successfully',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Import locations from CSV
 */
async function importLocations(req, res, next) {
  try {
    const { id, warehouseId } = req.params;
    const { locations } = req.body;

    if (!Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        message: 'Locations must be an array'
      });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const warehouse = client.warehouses.id(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    warehouse.locations.push(...locations);
    await client.save();

    res.json({
      success: true,
      message: `${locations.length} locations imported successfully`,
      data: { client }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get client hierarchy path
 */
async function getHierarchyPath(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const path = await client.getHierarchyPath();

    res.json({
      success: true,
      data: { path }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addWarehouse,
  updateWarehouse,
  addLocation,
  importLocations,
  getHierarchyPath
};
