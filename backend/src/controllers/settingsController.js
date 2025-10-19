const { Settings } = require('../models');
const path = require('path');
const fs = require('fs');

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

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: {
          code: 'NO_FILE',
          details: 'Please select a logo file to upload'
        }
      });
    }

    // Get global settings
    let settings = await Settings.getGlobalSettings();

    // Delete old logo file if exists
    if (settings.companySettings?.logo?.url) {
      const oldLogoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.companySettings.logo.url));
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Save new logo URL
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    if (!settings.companySettings) {
      settings.companySettings = {};
    }

    if (!settings.companySettings.logo) {
      settings.companySettings.logo = {};
    }

    settings.companySettings.logo.url = logoUrl;
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: logoUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/logos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
}

async function deleteLogo(req, res, next) {
  try {
    let settings = await Settings.getGlobalSettings();

    if (!settings.companySettings?.logo?.url) {
      return res.status(404).json({
        success: false,
        message: 'No logo found',
        error: {
          code: 'NO_LOGO',
          details: 'There is no logo to delete'
        }
      });
    }

    // Delete logo file
    const logoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.companySettings.logo.url));
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    // Remove from settings
    settings.companySettings.logo.url = null;
    settings.updatedBy = req.userId;
    await settings.save();

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getLogo(req, res, next) {
  try {
    const settings = await Settings.getGlobalSettings();

    if (!settings.companySettings?.logo?.url) {
      return res.status(404).json({
        success: false,
        message: 'No logo found',
        error: {
          code: 'NO_LOGO',
          details: 'No logo has been uploaded yet'
        }
      });
    }

    const logoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.companySettings.logo.url));

    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Logo file not found',
        error: {
          code: 'FILE_NOT_FOUND',
          details: 'The logo file is missing from the server'
        }
      });
    }

    res.sendFile(logoPath);
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
  updateIntegrations,
  uploadLogo,
  deleteLogo,
  getLogo
};
