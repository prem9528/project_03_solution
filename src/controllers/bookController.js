// const moment = require('moment')
const mongoose = require('mongoose')

const UserModel = require('../models/userModel')
const BookModel = require('../models/bookModel')
const ReviewModel = require('../models/reviewModel')

const dateRegex = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/;

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBook = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt} = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const isTitleAlreadyUsed = await BookModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'Title is already used.' })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'Excerpt is required' })
        }

        if(!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'User id is required' })
        }

        if(!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is an invalid userid` })
        }

        const isUserIdExist = await UserModel.findOne({ _id: userId })

        if (!isUserIdExist) return res.status(400).send({ status: false, message: `${userId} does not exist` })

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        }

        const isISBNAlreadyUsed = await BookModel.findOne({ ISBN: ISBN });

        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${ISBN} ISBN  is already in use.` });
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Category is required' })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: 'Subcategory is required' })
        }

        if(!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date is required`})
        }

        if(!dateRegex.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Releasing date must be "YYYY-MM-DD" in this form only And a "Valid Date"`})
        }

        const newBook = await BookModel.create({
            title, excerpt, userId, ISBN, category, subcategory, releasedAt
        });

        return res.status(201).send({ status: true, message: `Books created successfully`, data: newBook });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message , msg:"server" });
    }
}

const getAllBooks = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false }
        const queryParams = req.query;

        if (isValidRequestBody(queryParams)) {
            const { userId, category, subcategory } = queryParams;

            if (isValid(userId) && isValidObjectId(userId)) {
                filterQuery[ 'userId' ] = userId
            }

            if (isValid(category)) {
                filterQuery[ 'category' ] = category.trim()
            }

            if (isValid(subcategory)) {
                filterQuery[ 'subCategory' ] = subcategory.trim()
            }
        }

        const books = await BookModel.find(filterQuery).sort({ title: 1 }).select("_id title excerpt userId category subcategory releasedAt reviews")

        if (Array.isArray(books) && books.length === 0) {
            return res.status(404).send({ status: false, message: 'No Books found' })
        }

        return res.status(200).send({ status: true, message: 'Books list', data: books })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getBookDetails = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        const book = await BookModel.findById({ _id: bookId, isDeleted: false });

        if (!book) {
            return res.status(404).send({ status: false, message: `Book does not exit` })
        }

        const reviews = await ReviewModel.find({ bookId: bookId, isDeleted: false })

        const data = book.toObject()
        data['reviewsData'] = reviews

        return res.status(200).send({ status: true, message: 'Success', data: data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const updateBook = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const bookId = params.bookId
        const userId = req.userId

        // Validation stats
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        if (book.userId.toString() !== userId) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified', data: book })
        }

        // Extract params
        const { title, excerpt, releasedAt, ISBN } = requestBody;

        const updatedBookData = {}

        if (isValid(title)) {
            const isTitleAlreadyUsed = await BookModel.findOne({ title, _id: { $ne: bookId} });

            if (isTitleAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${title} title is already used`})
            }

            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                updatedBookData[ '$set' ] = {}

            updatedBookData[ '$set' ][ 'title' ] = title
        }

        if (isValid(excerpt)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                updatedBookData[ '$set' ] = {}
            updatedBookData[ '$set' ][ 'excerpt' ] = excerpt
        }

        if (isValid(ISBN)) {
            const isISBNAlreadyUsed = await BookModel.findOne({ ISBN, _id: { $ne: bookId }});
    
            if (isISBNAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${ISBN} ISBN is already exist` })
            }

            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                updatedBookData[ '$set' ] = {}
            updatedBookData[ '$set' ][ 'ISBN' ] = ISBN
        }

        if (isValid(releasedAt)) {

            if(!dateRegex.test(releasedAt)) {
                return res.status(400).send({ status: false, message: `Releasing date must be "YYYY-MM-DD" in this form only And a "Valid Date"`})
            }
            
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                updatedBookData[ '$set' ] = {}
            updatedBookData[ '$set' ][ 'releasedAt' ] = releasedAt;
        }

        const updatedBook = await BookModel.findOneAndUpdate({ _id: bookId }, updatedBookData, { new: true })

        return res.status(200).send({ status: true, message: 'Success', data: updatedBook });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const deleteBook = async function (req, res) {
    try {
        const params = req.params
        const bookId = params.bookId
        const userId = req.userId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        if (book.userId.toString() !== userId) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }

        await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: `Success` })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {
    createBook,
    getAllBooks,
    getBookDetails,
    updateBook,
    deleteBook,
}