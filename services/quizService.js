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

    let score = 0;
    const detailedAnswers = [];
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer.answer === question.correctAnswer;

        if (isCorrect) {
            score++;
        }

        detailedAnswers.push({
            questionText: question.questionText,
            selectedAnswer: userAnswer.answer,
            correctAnswer: question.correctAnswer,
            isCorrect,
        });
    });

    const result = await QuizResult.create({
        user: userId,
        quiz: quizId,
        score,
        totalQuestions,
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