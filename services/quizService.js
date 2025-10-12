const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const UserProgress = require('../models/UserProgress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const httpError = require('http-errors');
const mongoose = require('mongoose');

/**
 * Get a quiz by its ID, but without the correct answers.
 * @param {string} quizId - The ID of the quiz.
 * @returns {Promise<object>} - The quiz object for the student.
 */
exports.getQuizForStudent = async (quizId) => {
    const quiz = await Quiz.findById(quizId).select('-questions.correctAnswer');
    if (!quiz) {
        throw httpError.NotFound('Quiz not found');
    }
    return quiz;
};

/**
 * Get a quiz by its ID with correct answers (for instructors).
 * @param {string} quizId - The ID of the quiz.
 * @returns {Promise<object>} - The full quiz object.
 */
exports.getQuizWithAnswers = async (quizId) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw httpError.NotFound('Quiz not found');
    }
    return quiz;
};

/**
 * Submits answers for a quiz, grades them, and saves the result.
 * @param {string} quizId - The ID of the quiz.
 * @param {string} userId - The ID of the user.
 * @param {Array<object>} userAnswers - The user's answers.
 * @returns {Promise<object>} - The saved quiz result.
 */
exports.submitQuiz = async (quizId, userId, userAnswers) => {
    const quiz = await Quiz.findById(quizId).populate('lesson');
    if (!quiz) {
        throw httpError.NotFound('Quiz not found');
    }

    let autoGradedScore = 0;
    const detailedAnswers = [];
    const totalQuestions = quiz.questions.length;
    let hasManualGrading = false;

    quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let answerStatus = 'auto-graded';
        let isCorrect = null;
        let answerScore = 0;

        if (question.type === 'multiple-choice') {
            isCorrect = userAnswer.answer === question.correctAnswer;
            if (isCorrect) {
                answerScore = question.points || 1;
                autoGradedScore += answerScore;
            }
        } else {
            // 'essay' or 'upload' questions need manual review
            answerStatus = 'pending-review';
            hasManualGrading = true;
        }

        detailedAnswers.push({
            questionId: question._id,
            questionText: question.questionText,
            studentAnswer: userAnswer.answer,
            isCorrect,
            status: answerStatus,
            score: answerScore,
        });
    });

    const result = await QuizResult.create({
        user: userId,
        quiz: quizId,
        score: autoGradedScore,
        totalQuestions,
        // If any question needs manual grading, the whole result is pending review
        status: hasManualGrading ? 'pending-review' : 'completed',
        answers: detailedAnswers,
    });

    // Cập nhật điểm cho leaderboard
    if (score > 0) {
        await User.findByIdAndUpdate(userId, {
            $inc: { weeklyScore: score, monthlyScore: score }
        });
    }

    // Cập nhật tiến độ học tập nếu đạt yêu cầu
    const passPercentage = (score / totalQuestions) * 100;
    const PASS_THRESHOLD = 50; // Ngưỡng để coi là "hoàn thành" (50%)

    if (passPercentage >= PASS_THRESHOLD) {
        const courseId = quiz.lesson.course;
        await UserProgress.findOneAndUpdate(
            { user: userId, course: courseId },
            {
                $addToSet: {
                    completedLessons: { lesson: quiz.lesson._id }
                }
            },
            {
                upsert: true, // Tạo mới nếu chưa có
                new: true
            }
        );
    }

    return result;
};

/**
 * Creates a new quiz for a lesson.
 * @param {string} lessonId - The ID of the lesson.
 * @param {object} quizData - The data for the new quiz.
 * @param {string} userId - The ID of the user creating the quiz.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<object>} - The newly created quiz.
 */
exports.createQuiz = async (lessonId, quizData, userId, userRole) => {
    const lesson = await Lesson.findById(lessonId).populate({ path: 'course', select: 'author' });
    if (!lesson) throw httpError.NotFound('Lesson not found');

    // Authorize: only course author or admin can create a quiz
    if (lesson.course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to add a quiz to this lesson');
    }

    if (lesson.quiz) {
        throw httpError.Conflict('This lesson already has a quiz.');
    }

    const newQuiz = await Quiz.create({ ...quizData, lesson: lessonId });

    // Link the new quiz to the lesson
    lesson.quiz = newQuiz._id;
    await lesson.save();

    return newQuiz;
};

/**
 * Updates an existing quiz.
 * @param {string} quizId - The ID of the quiz to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<object>} - The updated quiz.
 */
exports.updateQuiz = async (quizId, updateData, userId, userRole) => {
    const quiz = await Quiz.findById(quizId).populate({ path: 'lesson', populate: { path: 'course', select: 'author' } });
    if (!quiz) throw httpError.NotFound('Quiz not found');

    if (quiz.lesson.course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to update this quiz');
    }

    Object.assign(quiz, updateData);
    await quiz.save();
    return quiz;
};

/**
 * Deletes a quiz.
 * @param {string} quizId - The ID of the quiz to delete.
 * @param {string} userId - The ID of the user.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<void>}
 */
exports.deleteQuiz = async (quizId, userId, userRole) => {
    const quiz = await Quiz.findById(quizId).populate({ path: 'lesson', populate: { path: 'course', select: 'author' } });
    if (!quiz) throw httpError.NotFound('Quiz not found');

    if (quiz.lesson.course.author.toString() !== userId && userRole !== 'admin') {
        throw httpError.Forbidden('Not authorized to delete this quiz');
    }

    // Unlink quiz from lesson
    await Lesson.findByIdAndUpdate(quiz.lesson._id, { $unset: { quiz: "" } });
    await quiz.deleteOne();
};

/**
 * Retrieves all quiz submissions that are pending manual review for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Array>} - A list of submissions to be graded.
 */
exports.getSubmissionsForGrading = async (courseId) => {
    const course = await Course.findById(courseId).select('lessons').lean();
    if (!course) throw httpError.NotFound('Course not found');

    const lessonIds = course.lessons;
    const quizzes = await Quiz.find({ lesson: { $in: lessonIds } }).select('_id').lean();
    const quizIds = quizzes.map(q => q._id);

    const submissions = await QuizResult.find({
        quiz: { $in: quizIds },
        status: 'pending-review'
    })
    .populate('user', 'username avatarUrl')
    .populate({ path: 'quiz', select: 'title' })
    .sort({ createdAt: 1 })
    .lean();

    return submissions;
};

/**
 * Manually grades a specific answer in a quiz submission.
 * @param {string} resultId - The ID of the QuizResult.
 * @param {string} answerId - The ID of the answer within the result.
 * @param {object} gradeData - The grading data { score, feedback }.
 * @returns {Promise<object>} - The updated quiz result.
 */
exports.gradeSubmission = async (resultId, answerId, gradeData) => {
    const { score, feedback } = gradeData;

    const result = await QuizResult.findById(resultId);
    if (!result) throw httpError.NotFound('Submission result not found.');

    const answer = result.answers.id(answerId);
    if (!answer) throw httpError.NotFound('Answer not found in this submission.');
    if (answer.status !== 'pending-review') throw httpError.Conflict('This answer has already been graded.');

    answer.score = score;
    answer.instructorFeedback = feedback;
    answer.status = 'graded';

    // Check if all manually graded questions are now graded
    const allGraded = result.answers.every(a => a.status !== 'pending-review');
    if (allGraded) {
        result.status = 'completed';
        // Recalculate total score
        result.score = result.answers.reduce((total, ans) => total + ans.score, 0);
    }

    await result.save();
    return result;
};