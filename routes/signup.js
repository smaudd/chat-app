const router = require('express').Router()
const User = require('../model/User.model')
const emailValidation = require('../lib/emailValidation')
const pwdSalt = require('../lib/pwdSalt')
const getToken = require('../lib/token')
const uuid4 = require('uuid/v4')

router.post('/', async (req, res, next) => {
    console.log(req.body)
    const { email, password, nickname, contacts } = req.body
    try {
        const valid = await emailValidation(email, nickname)
        const saved = await save(email, password, nickname, contacts)
        console.log('saved', saved)
        const token = await getToken(saved)
        res.status(200).send({ msg: 'User created', token: token, _id: saved._id })
    } catch (err) {
        errorHandler(err, res)
    }
})

const save = async (email, password, nickname, contacts) => {
    return new Promise(async (resolve, reject) => {
        try {
            const saltyPwd = await pwdSalt(password)
            const user = new User({ 
                email, 
                nickname, 
                password: saltyPwd,
                signature: await uuid4(),
                contacts
            })
            await user.save()
            resolve(user)
        } catch (err) {
            reject(err)
        }
    })
}

const errorHandler = (err, res) => {
    if (err === 'email') {
        res.status(409).send({ msg: 'Email already in use' })
    } else if (err === 'nickname') {
        res.status(409).send({ msg: 'Nickname already in use' })
    } else {
        console.log(err)
        res.status(400).send({ msg: 'Request problems' })
    }
}

module.exports = router