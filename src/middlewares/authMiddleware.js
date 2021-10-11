// const {jwt} = require('../jsonwebtoken')
const jwt = require("jsonwebtoken")

const authMiddleware =  (req, res, next) => {
    try {
        const token = req.header('x-api-key')
        console.log("token" , token)
        if(!token) {
            res.status(403).send({status: false, message: `Missing authentication token in request`})
            return
        }

        const decoded =  jwt.verify(token, 'someverysecuredprivatekey291@(*#*(@(@()');
      console.log("decode", decoded)

        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return
        }

        req.userId = decoded.userId
        console.log("3i9r9r9",req.userId)

        next()
    } catch (error) {
        if(error.name){
            res.status(400).send({status: false, message: "jwt expired"})
        }
        console.error(`Error0000! ${error.message}`)
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = authMiddleware