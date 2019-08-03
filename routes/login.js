const router = require('express').Router()
const pwdVerify = require('../lib/pwdVerify')
const getToken = require('../lib/token')
const User = require('../model/User.model')
const uuid4 = require('uuid/v4')

router.post('/', async (req, res, next) => {
    const { email, password, player_id } = req.body
    console.log(player_id)
    try {
        const user = await User.findOneAndUpdate(
            { email }, 
            { signature: await uuid4(), status: true, player_id },
            { new: true }
        )
        if (user) {
            await pwdVerify(password, user.password)
            const token = await getToken(user)
            return res.status(200).send({ 
                msg: 'Login successfully', 
                token,
                _id: user._id,
                contacts: user.contacts
            })
        } else {
            errorHandler('Invalid Credentials', res)
        }
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

const errorHandler = (err, res) =>  {
    if (err === 'Invalid Credentials') {
        return res.status(422).send({ msg: err })
    } else {
        console.log(err)
        res.status(400).send({ msg: 'Request problems' })
    }
}

module.exports = router