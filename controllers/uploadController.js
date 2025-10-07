/**
 * @desc    Upload a file and return its URL
 * @route   POST /api/upload
 * @access  Private (Admin/Editor)
 */
exports.uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }

    // Trả về đường dẫn công khai của file đã tải lên
    // Ví dụ: /uploads/image-1678886400000.jpg
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
        url: fileUrl
    });
};