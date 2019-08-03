const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../model/User.model')
const io = require('socket.io-client')
const OneSignal = require('../lib/OneSignal')

const socket = io(process.env.BASE_URL + '/notifications', {
    query: {
        token: 'GIMME'
    }
})

const isConnected = () => {
    console.log(socket)
}

router.get('/read', async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization, process.env.SECRET)
    if (!token) {
        console.log(token)
        return res.status(401).send({ msg: 'Invalid token' })
    }
    const { _id } = token
    try {
        const _ids = await User.findOne({ _id }, { contacts: 1, status: 1, nickname: 1 })
        res.status(200).send({ msg: 'Contacts found', contacts: _ids.contacts })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    } 
})

router.get('/find', async (req, res, next) => {
    const { nickname } = req.query
    const exp = new RegExp(`^${nickname}`, 'gi')
    try {
        const users = await User.find({ nickname: exp }, { nickname: 1, _id: 1 })
        res.status(200).send(users)
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.post('/add', async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization, process.env.SECRET)
    const { nickname } = req.body
    try {
        const contact = await User.findOne({ nickname })
        if (!contact) {
            return res.status(404).send({ msg: 'User not found'})
        }
        const { _id, player_id } = contact
        const status = false
        await User.findByIdAndUpdate(
            token._id,
            { $addToSet: { contacts: { _id, nickname, status } } },
            { safe: true, upsert: true, new: true }
        )
        const notification = {
            body: nickname,
            to: contact._id,
            code: 38
        }
        await OneSignal.newNotification(notification, player_id)
        res.status(200).send({ msg: 'Contact added' })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.put('/delete', async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization, process.env.SECRET)
    const { _id } = req.body
    try {
        await User.findByIdAndUpdate(
            token._id,
            { $pull: { contacts: { _id } } },
            { safe: true, upsert: true, new: true }
        )
        res.status(200).send({ msg: 'Contact deleted' })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.put('/accept', async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization, process.env.SECRET)
    const { _id } = req.body
    const status = true
    try {
        const user1 = await User.findOneAndUpdate(
            { _id: token._id, "contacts._id": _id }, 
            { 
                $set: { "contacts.$.status": status },
            },
            { safe: true, upsert: true, new: true }
        )
        await User.findByIdAndUpdate(
            _id,
            { $addToSet: { contacts: { _id: token._id, status } } },
            { safe: true, upsert: true, new: true }
        )
        res.status(200).send(user1)
    } catch (err) {
        if (err.errmsg === 'The positional operator did not find the match needed from the query.') {
            res.status(404).send({ msg: 'Contact not found' })
        }
        errorHandler(err, res)
    }
})

const errorHandler = (err, res) =>  {
    res.status(502).send({ msg: 'Problems with the server'})
}

module.exports = router