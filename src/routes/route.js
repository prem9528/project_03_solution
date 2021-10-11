const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const authMiddleware = require('../middlewares/authMiddleware')

// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Book routes
router.post('/books', authMiddleware, bookController.createBook)
router.get('/books', authMiddleware, bookController.getAllBooks)
router.get('/books/:bookId', authMiddleware, bookController.getBookDetails)
router.put('/books/:bookId', authMiddleware, bookController.updateBook)
router.delete('/books/:bookId', authMiddleware, bookController.deleteBook)

// Review routes
router.post('/books/:bookId/review', reviewController.addReview)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)

module.exports = router;