const mongoose = require('mongoose')

// const {validator} = require('../utils')

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 15,
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)