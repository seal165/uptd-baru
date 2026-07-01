const express = require('express');
const router = express.Router();
const kuisionerController = require('../controllers/kuisionerController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const {
    submitPublicSchema,
    questionSchema,
    reorderSchema
} = require('../validations/kuisionerValidation');

// PUBLIC (tanpa auth)
router.get('/public/questions', kuisionerController.listQuestions);
router.post(
    '/public/submit',
    validate(submitPublicSchema),
    kuisionerController.submitPublic
);
router.get('/check/:submissionId', kuisionerController.check);

// QUESTIONS (admin)
router.get('/questions', authMiddleware, kuisionerController.listQuestions);
router.get('/questions/:id', authMiddleware, kuisionerController.detailQuestion);
router.post(
    '/questions',
    authMiddleware,
    requireRole('admin'),
    validate(questionSchema),
    kuisionerController.createQuestion
);
router.put(
    '/questions/:id',
    authMiddleware,
    requireRole('admin'),
    validate(questionSchema),
    kuisionerController.updateQuestion
);
router.delete(
    '/questions/:id',
    authMiddleware,
    requireRole('admin'),
    kuisionerController.deleteQuestion
);
router.post(
    '/questions/reorder',
    authMiddleware,
    requireRole('admin'),
    validate(reorderSchema),
    kuisionerController.reorderQuestions
);

// STATS
router.get('/stats', authMiddleware, kuisionerController.stats);

// JAWABAN
router.get('/', authMiddleware, kuisionerController.list);
router.get('/:id', authMiddleware, kuisionerController.detail);
router.post('/', kuisionerController.create);
router.put('/:id', authMiddleware, kuisionerController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), kuisionerController.delete);

module.exports = router;
