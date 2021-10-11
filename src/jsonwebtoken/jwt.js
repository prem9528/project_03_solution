// const jwt = require('jsonwebtoken')

// // const {systemConfig} = require('../configs')

// const createToken = async ({userId}) => {
//     try {
//         const token = await jwt.sign({
//             userId,
//             iat: Math.floor(Date.now() / 1000),
//             exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
//         }, 'someverysecuredprivatekey291@(*#*(@(@()')
//         return token
//     } catch (error) {
//         console.error(`Error! creating jwt token ${error.message}`);
//         throw error;
//     }
// }

// const verifyToken = async (token) => {
//     try {
//         const decoded = await jwt.verify(token, 'someverysecuredprivatekey291@(*#*(@(@()');
//         return decoded
//     } catch (error) {
//         console.error(`Error! verifying jwt token ${error.message}`)
//         return false
//     }
// }

// module.exports = {
//     createToken,
//     verifyToken
// }