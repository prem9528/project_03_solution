
const jwt = require("jsonwebtoken")

const authMiddleware =  (req, res, next) => {
    try {
        let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];
        if (!token) {
            return res.status(400).send({ status: false, msg: "Token required! Please login to generate token" });
        }

        let tokenValidity = jwt.decode(token, "bookM49");
        let tokenTime = (tokenValidity.exp) * 1000;
        let CreatedTime = Date.now()
        if (CreatedTime > tokenTime) {
            return res.status(400).send({ status: false, msg: "token is expired, login again" })
        }

        const decoded =  jwt.verify(token, 'group49project03');

        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return
        }

        req.userId = decoded.userId

        next()
    } catch (error) {
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = authMiddleware