const jwt = require('jsonwebtoken')
const User = require('../model/User.model')

const tokenValidation = (token) => {
    return new Promise(async (resolve, reject) => {
        jwt.verify(token, process.env.SECRET, async (error, decoded) => {
            if (error) reject(false)
            if (!decoded.signature) reject(false)
            try {
                const user = User.findOne({ signature: decoded.signature })
                if (user) {
                    return resolve(user)
                }
                reject(false)
            } catch(err) {
                console.log(new Error(err))
                reject(false)
            }
        })
    })
} 

module.exports = tokenValidation