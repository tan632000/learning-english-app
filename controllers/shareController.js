const shareService = require('../services/shareService');

/**
 * @desc    Create a shareable link for an achievement
 * @route   POST /api/share/course-completion
 * @access  Private
 */
exports.createShareLink = async (req, res, next) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required.' });
        }
        const shareable = await shareService.createShareableLink(req.user.id, courseId);
        const shareUrl = `${req.protocol}://${req.get('host')}/share/progress/${shareable.shareId}`;
        res.status(201).json({ shareUrl });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get details of a shared achievement
 * @route   GET /api/share/progress/:shareId
 * @access  Public
 */
exports.getSharedProgress = async (req, res, next) => {
    try {
        const { shareId } = req.params;
        const progressDetails = await shareService.getSharedProgress(shareId);
        res.json(progressDetails);
    } catch (error) {
        next(error);
    }
};