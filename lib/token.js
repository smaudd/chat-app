const jwt = require('jsonwebtoken')

const getToken = async (user) => {
    return new Promise((resolve) => {
        const payload = {
            signature: user.signature
        }
        const token = jwt.sign(payload, process.env.SECRET)
        resolve(token)
    })
}

module.exports = getToken