const flashcardService = require('../services/flashcardService');

exports.getAllSets = async (req, res, next) => {
    try {
        const sets = await flashcardService.getAllSets();
        res.json(sets);
    } catch (error) {
        next(error);
    }
};

exports.getSetById = async (req, res, next) => {
    try {
        const set = await flashcardService.getSetById(req.params.id);
        res.json(set);
    } catch (error) {
        next(error);
    }
};

exports.createSet = async (req, res, next) => {
    try {
        const set = await flashcardService.createSet(req.body, req.user.id);
        res.status(201).json(set);
    } catch (error) {
        next(error);
    }
};

exports.updateSet = async (req, res, next) => {
    try {
        const set = await flashcardService.updateSet(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );
        res.json(set);
    } catch (error) {
        next(error);
    }
};

exports.deleteSet = async (req, res, next) => {
    try {
        await flashcardService.deleteSet(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};