const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
    banner: {
        imageUrl: { type: String, default: '' },
        linkUrl: { type: String, default: '' },
        isActive: { type: Boolean, default: false }
    },
    systemNotification: {
        message: { type: String, default: '' },
        type: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
        isActive: { type: Boolean, default: false }
    },
    privacyPolicy: {
        content: { type: String, default: '' }, // Can store HTML or Markdown
        lastUpdated: { type: Date }
    },
    termsOfService: {
        content: { type: String, default: '' }, // Can store HTML or Markdown
        lastUpdated: { type: Date }
    },
    // Store sensitive keys securely. This is just a placeholder structure.
    // In a real-world app, these should be managed via environment variables or a secret manager.
    apiKeys: {
        googleMaps: { type: String, select: false }, // `select: false` prevents it from being returned by default
        openAI: { type: String, select: false },
    }
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('Setting', settingSchema);