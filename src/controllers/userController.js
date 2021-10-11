// const jwt = require('../jsonwebtoken/jwt')
const UserModel = require('../models/userModel')


const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const reNumber = /\d+/


const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}


const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}


const register = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide user details'})
        }

        // Extract params
        const {title, name, phone, email, password, address} = requestBody; // Object destructing

        // Validation starts
        if(!isValid(title)) {
            return res.status(400).send({status: false, message: 'Title is required'})
        }
        
        if((['Mr', 'Mrs', 'Miss', 'Mast'].indexOf(title) === -1)) {
            return res.status(400).send({status: false, message: `Title should be among ${['Mr', 'Mrs', 'Miss', 'Mast'].join(', ')}`})
        }

        if(!isValid(name)) {
            return res.status(400).send({status: false, message: ' Name is required'})
        }

        if(!isValid(phone)) {
            return res.status(400).send({status: false, message: 'Phone number is required'})
        }
        
        if(!(!isNaN(Number(phone)) && reNumber.test(phone))) {
            return res.status(400).send({status: false, message: 'Phone number should be a valid number'})
        }

        if(!isValid(email)) {
            return res.status(400).send({status: false, message: `Email is required`})
        }
        
        if(!re.test(email)) {
            return res.status(400).send({status: false, message: `Email should be a valid email address`})
        }

        if(!isValid(password)) {
            return res.status(400).send({status: false, message: `Password is required`})
        }
        
        if(password.split("").length<8) {
            return res.status(400).send({status: false, message: `Password lenght must be between 8 to 15 char long`})
        }
        if(password.split("").length>15) {
            return res.status(400).send({status: false, message: `Password lenght must be between 8 to 15 char long`})
        }
        
        const isPhoneAlreadyUsed = await UserModel.findOne({phone}); // {email: email} object shorthand property

        if(isPhoneAlreadyUsed) {
            return res.status(400).send({status: false, message: `${phone} phone number is already registered`})
        }
        
        const isEmailAlreadyUsed = await UserModel.findOne({email}); // {email: email} object shorthand property

        if(isEmailAlreadyUsed) {
            return res.status(400).send({status: false, message: `${email} email address is already registered`})
        }
        // Validation ends

        const userData = {title, name, phone, email, password, address}
        const newUser = await UserModel.create(userData);

        return res.status(201).send({status: true, message: `User created successfully`, data: newUser});
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

const login = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})
            return
        }

        // Extract params
        const {email, password} = requestBody;
        
        // Validation starts
        if(!isValid(email)) {
            return res.status(400).send({status: false, message: `Email is required`})
        }
        
        if(!re.test(email)) {
            return res.status(400).send({status: false, message: `Email should be a valid email address`})
        }

        if(!isValid(password)) {
            return res.status(400).send({status: false, message: `Password is required`})
        }
        // Validation ends

        const user = await UserModel.findOne({email, password});

        if(!user) {
            return res.status(401).send({status: false, message: `Invalid login credentials`});
        }

        // const token = await jwt.createToken({userId: user._id});
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, 'someverysecuredprivatekey291@(*#*(@(@()')

        return res.status(200).send({status: true, message: `User login successfull`, data: {token}});
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {
    register,
    login
}