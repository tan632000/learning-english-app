const quizService = require('../services/quizService');

/**
 * @desc    Get a quiz for a student (without answers)
 * @route   GET /api/quizzes/:id
 * @access  Private
 */
exports.getQuiz = async (req, res, next) => {
    try {
        let quiz;
        // Instructors get the quiz with answers, students get it without.
        if (req.user && ['admin', 'editor'].includes(req.user.role)) {
            quiz = await quizService.getQuizWithAnswers(req.params.id);
        } else {
            quiz = await quizService.getQuizForStudent(req.params.id);
        }

        res.json(quiz);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit answers for a quiz and get the result
 * @route   POST /api/quizzes/:id/submit
 * @access  Private
 */
exports.submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;
        const result = await quizService.submitQuiz(req.params.id, req.user.id, answers);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new quiz for a lesson
 * @route   POST /api/quizzes
 * @access  Private (Admin/Editor)
 */
exports.createQuiz = async (req, res, next) => {
    try {
        const { lessonId, ...quizData } = req.body;
        if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required' });

        const quiz = await quizService.createQuiz(lessonId, quizData, req.user.id, req.user.role);
        res.status(201).json(quiz);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an existing quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private (Admin/Editor)
 */
exports.updateQuiz = async (req, res, next) => {
    try {
        const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user.id, req.user.role);
        res.json(quiz);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private (Admin/Editor)
 */
exports.deleteQuiz = async (req, res, next) => {
    try {
        await quizService.deleteQuiz(req.params.id, req.user.id, req.user.role);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all submissions pending review for a course
 * @route   GET /api/quizzes/submissions/pending?courseId=:courseId
 * @access  Private (Admin/Editor)
 */
exports.getSubmissionsForGrading = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ message: 'Course ID is required' });

        const submissions = await quizService.getSubmissionsForGrading(courseId);
        res.json(submissions);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Grade a single answer in a submission
 * @route   POST /api/quizzes/submissions/:resultId/grade/:answerId
 * @access  Private (Admin/Editor)
 */
exports.gradeSubmission = async (req, res, next) => {
    try {
        const { resultId, answerId } = req.params;
        const { score, feedback } = req.body;

        if (score === undefined || !feedback) {
            return res.status(400).json({ message: 'Score and feedback are required.' });
        }

        const updatedResult = await quizService.gradeSubmission(resultId, answerId, { score, feedback });
        res.json(updatedResult);
    } catch (error) {
        next(error);
    }
};
