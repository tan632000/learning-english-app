const settingService = require('../services/settingService');

/**
 * @desc    Get system settings
 * @route   GET /api/settings
 * @access  Public (for general settings), Private (for sensitive settings)
 */
exports.getSettings = async (req, res, next) => {
    try {
        // Only include sensitive API keys if the user is an admin
        const includeApiKeys = req.user && req.user.role === 'admin';
        const settings = await settingService.getSettings(includeApiKeys);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private (Admin)
 */
exports.updateSettings = async (req, res, next) => {
    try {
        // Ensure fields like `lastUpdated` are set when content changes
        if (req.body.privacyPolicy) req.body.privacyPolicy.lastUpdated = new Date();
        if (req.body.termsOfService) req.body.termsOfService.lastUpdated = new Date();

        const settings = await settingService.updateSettings(req.body);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};