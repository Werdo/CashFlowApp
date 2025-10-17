const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scope: {
    type: String,
    enum: ['global', 'user'],
    default: 'global'
  },
  companySettings: {
    companyName: {
      type: String,
      default: 'AssetFlow'
    },
    logo: {
      url: String,
      showInNavbar: {
        type: Boolean,
        default: true
      },
      showInReports: {
        type: Boolean,
        default: true
      }
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      website: String
    }
  },
  themeSettings: {
    colors: {
      primary: {
        type: String,
        default: '#0066CC'
      },
      secondary: {
        type: String,
        default: '#6C757D'
      },
      success: {
        type: String,
        default: '#28A745'
      },
      danger: {
        type: String,
        default: '#DC3545'
      },
      warning: {
        type: String,
        default: '#FFC107'
      },
      info: {
        type: String,
        default: '#17A2B8'
      },
      light: {
        type: String,
        default: '#F8F9FA'
      },
      dark: {
        type: String,
        default: '#343A40'
      }
    },
    backgrounds: {
      body: {
        type: String,
        default: '#FFFFFF'
      },
      sidebar: {
        type: String,
        default: '#2C3E50'
      },
      navbar: {
        type: String,
        default: '#34495E'
      },
      card: {
        type: String,
        default: '#FFFFFF'
      }
    },
    typography: {
      fontFamily: {
        type: String,
        default: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      },
      fontSize: {
        base: {
          type: String,
          default: '14px'
        },
        small: {
          type: String,
          default: '12px'
        },
        large: {
          type: String,
          default: '16px'
        }
      },
      fontWeights: {
        normal: {
          type: Number,
          default: 400
        },
        medium: {
          type: Number,
          default: 500
        },
        bold: {
          type: Number,
          default: 700
        }
      }
    }
  },
  headerSettings: {
    appTitle: {
      type: String,
      default: 'AssetFlow'
    },
    showAppTitle: {
      type: Boolean,
      default: true
    },
    showCompanyName: {
      type: Boolean,
      default: true
    },
    navbarPosition: {
      type: String,
      enum: ['fixed-top', 'static'],
      default: 'fixed-top'
    },
    navbarHeight: {
      type: String,
      default: '60px'
    }
  },
  systemSettings: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    itemsPerPage: {
      type: Number,
      default: 25
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      expiryAlerts: {
        type: Boolean,
        default: true
      },
      lowStockAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  integrationSettings: {
    ai: {
      enabled: {
        type: Boolean,
        default: false
      },
      defaultProvider: {
        type: String,
        enum: ['openai', 'anthropic', 'local'],
        default: 'openai'
      },
      apiKeys: {
        openai: String,
        anthropic: String
      },
      models: {
        openai: {
          type: String,
          default: 'gpt-4'
        },
        anthropic: {
          type: String,
          default: 'claude-3-sonnet-20240229'
        }
      }
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
      fromEmail: String,
      secure: {
        type: Boolean,
        default: true
      }
    },
    storage: {
      provider: {
        type: String,
        enum: ['local', 's3', 'azure'],
        default: 'local'
      },
      credentials: {
        accessKey: String,
        secretKey: String,
        bucket: String,
        region: String
      },
      maxFileSize: {
        type: String,
        default: '10MB'
      },
      allowedTypes: {
        type: [String],
        default: ['image/jpeg', 'image/png', 'application/pdf']
      }
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
settingsSchema.index({ scope: 1, userId: 1 });

// Static method to get global settings
settingsSchema.statics.getGlobalSettings = async function() {
  let settings = await this.findOne({ scope: 'global' });

  if (!settings) {
    settings = await this.create({ scope: 'global' });
  }

  return settings;
};

// Static method to get user settings
settingsSchema.statics.getUserSettings = async function(userId) {
  let settings = await this.findOne({ scope: 'user', userId });

  if (!settings) {
    const globalSettings = await this.getGlobalSettings();
    settings = await this.create({
      scope: 'user',
      userId,
      ...globalSettings.toObject()
    });
  }

  return settings;
};

// Method to merge with global settings
settingsSchema.methods.mergeWithGlobal = async function() {
  if (this.scope === 'global') return this;

  const globalSettings = await mongoose.model('Settings').getGlobalSettings();
  const merged = { ...globalSettings.toObject(), ...this.toObject() };

  return merged;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
