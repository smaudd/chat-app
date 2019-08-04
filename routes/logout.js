const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../model/User.model')
const uuid4 = require('uuid/v4')

router.post('/', async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization, process.env.SECRET)
    const { _id } = token
    console.log(_id)
    try {
        await User.findOneAndUpdate(
            { _id }, 
            { signature: await uuid4(), state: false },
            { new: true }
        )
        res.status(200).send({ msg: 'Logged out' })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

const errorHandler = (err, res) =>  {
    res.status(503).send({ msg: 'Something went wrong', err: err })
}

module.exports = router