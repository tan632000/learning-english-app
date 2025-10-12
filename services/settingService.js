const Setting = require('../models/Setting');

/**
 * Retrieves the system settings. Creates default settings if none exist.
 * @param {boolean} includeApiKeys - Whether to include sensitive API keys in the result.
 * @returns {Promise<object>} - The system settings object.
 */
exports.getSettings = async (includeApiKeys = false) => {
    let query = Setting.findOne();

    if (includeApiKeys) {
        query = query.select('+apiKeys.googleMaps +apiKeys.openAI');
    }

    let settings = await query.lean();

    // Singleton Pattern: If no settings doc, create one.
    if (!settings) {
        settings = await Setting.create({});
    }

    return settings;
};

/**
 * Updates the system settings.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} - The updated settings object.
 */
exports.updateSettings = async (updateData) => {
    // Use findOneAndUpdate with upsert to ensure the single settings document is always updated.
    const settings = await Setting.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
        runValidators: true
    });
    return settings;
};