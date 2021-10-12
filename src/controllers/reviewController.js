// const moment = require('moment')
const mongoose = require('mongoose')

const UserModel = require('../models/userModel')
const BookModel = require('../models/bookModel')
const ReviewModel = require('../models/reviewModel')

const dateRegex = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/;
const reNumber = /\d+/

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const addReview = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const bookId = params.bookId

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }

        if(!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is an invalid book id` })
        }

        const book = await BookModel.findOne({_id: bookId, isDeleted: false})

        if(!book) return res.status(404).send({status: false, message: `Book does not exist`})

        const { review, rating, reviewedBy} = requestBody;
        
        if(!isValid(rating)) {
            return res.status(400).send({ status: false, message: 'Rating is required' })
        }
        
        if (!(!isNaN(Number(rating)) && reNumber.test(rating))) {
            return res.status(400).send({ status: false, message: 'Rating should be a valid number' })
        }

        if(rating<1) {
            return res.status(400).send({status: false, message: `Rating must be between 1 to 5`})
        }
        if(rating>5) {
            return res.status(400).send({status: false, message: `Rating must be between 1 to 5`})
        }

        const newReview = await ReviewModel.create({
            bookId,
            rating,
            review,
            reviewedBy,
            reviewedAt: new Date()
        });

        book.reviews = book.reviews + 1
        await book.save()

        const data = book.toObject()
        data['reviewsData'] = newReview

        return res.status(201).send({ status: true, message: `Review added successfully`, data: data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const updateReview = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const bookId = params.bookId
        const reviewId = params.reviewId

        // Validation stats
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
        }

        const reviewExist = await ReviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false})

        if(!reviewExist) return res.status(404).send({status: false, message: `Book review not found`})

        const data = book.toObject()
        data['reviewsData'] = reviewExist

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Review unmodified', data: data })
        }

        // Extract params
        const { review, rating, reviewedBy} = requestBody;
        
        const updatedReviewData = {}

        if (isValid(rating)) {
            if (!(!isNaN(Number(rating)) && reNumber.test(rating))) {
                return res.status(400).send({ status: false, message: 'Rating should be a valid number' })
            }
    
            if(rating<1) {
                return res.status(400).send({status: false, message: `Rating must be between 1 to 5`})
            }
            if(rating>5) {
                return res.status(400).send({status: false, message: `Rating must be between 1 to 5`})
            }

                if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set'))
                    updatedReviewData[ '$set' ] = {}
    
                updatedReviewData[ '$set' ][ 'rating' ] = rating
        }

        if (isValid(review)) {
            if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set'))
                updatedReviewData[ '$set' ] = {}

            updatedReviewData[ '$set' ][ 'review' ] = review
        }

        if (isValid(reviewedBy)) {
            if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set'))
                updatedReviewData[ '$set' ] = {}

            updatedReviewData[ '$set' ][ 'reviewedBy' ] = reviewedBy
        }

            updatedReviewData[ '$set' ][ 'reviewedAt' ] = new Date()
        

        const updatedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId }, updatedReviewData, { new: true })

        data['reviewsData'] = updatedReview

        return res.status(200).send({ status: true, message: 'Success', data: data });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const deleteReview = async function (req, res) {
    try {
        const params = req.params
        const bookId = params.bookId
        const reviewId = params.reviewId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!isValidObjectId(reviewId)) {
            res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false})

        if(!book) return res.status(404).send({ status: false, message: 'Book not found'})

        const review = await ReviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!review) {
            return res.status(404).send({ status: false, message: `Review not found` })
        }

        await ReviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, deletedAt: new Date() } } )

        book.reviews = book.reviews === 0 ? 0 : book.reviews - 1
        await book.save()

        return res.status(200).send({ status: true, message: `Success` })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {
    addReview,
    updateReview,
    deleteReview
}