const { Settings } = require('../models');

async function getSettings(req, res, next) {
  try {
    // Get user settings or global settings
    let settings;
    if (req.user) {
      settings = await Settings.getUserSettings(req.userId);
    } else {
      settings = await Settings.getGlobalSettings();
    }

    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const updates = req.body;

    let settings;
    if (req.user) {
      settings = await Settings.findOne({ scope: 'user', userId: req.userId });
      if (!settings) {
        settings = new Settings({ scope: 'user', userId: req.userId, ...updates });
      } else {
        Object.assign(settings, updates);
      }
    } else {
      settings = await Settings.findOne({ scope: 'global' });
      if (!settings) {
        settings = new Settings({ scope: 'global', ...updates });
      } else {
        Object.assign(settings, updates);
      }
    }

    settings.updatedBy = req.userId;
    await settings.save();

    res.json({ success: true, message: 'Settings updated', data: { settings } });
  } catch (error) {
    next(error);
  }
}

async function updateTheme(req, res, next) {
  try {
    let settings = await Settings.getUserSettings(req.userId);
    settings.themeSettings = { ...settings.themeSettings, ...req.body };
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({ success: true, message: 'Theme updated', data: { theme: settings.themeSettings } });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req, res, next) {
  try {
    let settings = await Settings.getGlobalSettings();
    settings.companySettings = { ...settings.companySettings, ...req.body };
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({ success: true, message: 'Company settings updated', data: { company: settings.companySettings } });
  } catch (error) {
    next(error);
  }
}

async function updateSystem(req, res, next) {
  try {
    let settings = await Settings.getUserSettings(req.userId);
    settings.systemSettings = { ...settings.systemSettings, ...req.body };
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({ success: true, message: 'System settings updated', data: { system: settings.systemSettings } });
  } catch (error) {
    next(error);
  }
}

async function updateIntegrations(req, res, next) {
  try {
    let settings = await Settings.getGlobalSettings();
    settings.integrationSettings = { ...settings.integrationSettings, ...req.body };
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({ success: true, message: 'Integration settings updated', data: { integrations: settings.integrationSettings } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  updateTheme,
  updateCompany,
  updateSystem,
  updateIntegrations
};
