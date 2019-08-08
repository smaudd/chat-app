const router = require('express').Router()
const User = require('../model/User.model')
const { newNotification } = require('../lib/OneSignal')

router.get('/read', async (req, res, next) => {
    const { _id } = req.user.locals
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
        const users = await User.find(
            { nickname: exp }, 
            { nickname: 1, _id: 1 }
        )
        res.status(200).send(users)
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.post('/add', async (req, res, next) => {
    const { _id } = res.locals.user
    const { nickname } = req.body
    try {
        const contact = await User.findOne({ nickname })
        if (!contact) {
            return res.status(404).send({ msg: 'User not found'})
        }
        const { contact_id, player_id } = contact
        const status = false
        const user = await User.findByIdAndUpdate(
            _id,
            { $addToSet: { contacts: { contact_id, nickname, status } } },
            { safe: true, upsert: true, new: true }
        )
        const notification = {
            contents: {
                en: `${user.nickname} wants to be part of your friends`
            },
            data: {
                contactId: _id,
                date: new Date()
            },
            player_ids: [player_id]
        }
        await newNotification(notification)
        res.status(200).send({ 
            msg: 'Contact added. Waiting for acceptance.', 
            contact: {
                _id: contact._id,
                nickname: contact.nickname,
                status: false
            }
        })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.put('/delete', async (req, res, next) => {
    const { _id } = res.locals.user
    const contact_id = req.body._id
    try {
        await User.findByIdAndUpdate(
            _id,
            { $pull: { contacts: { contact_id } } },
            { safe: true, upsert: true, new: true }
        )
        res.status(200).send({ msg: 'Contact deleted' })
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.post('/accept', async (req, res, next) => {
    console.log('ACCEPT TOUCHED')
    const { _id } = res.locals.user
    const { contactId } = req.body
    const status = true
    try {
        const user1 = await User.findOneAndUpdate(
            { _id, "contacts._id": contactId }, 
            { 
                $set: { "contacts.$.status": status },
            },
            { safe: true, upsert: true, new: true }
        )
        const user2 = await User.findByIdAndUpdate(
            contactId,
            { $addToSet: { contacts: { _id, status } } },
            { safe: true, upsert: true, new: true }
        )
        res.status(200).send({ contactId: user2._id })
    } catch (err) {
        if (err.errmsg === 'The positional operator did not find the match needed from the query.') {
            res.status(404).send({ msg: 'Contact not found' })
        }
        errorHandler(err, res)
    }
})

const errorHandler = (err, res) =>  {
    console.log(err)
    res.status(502).send({ msg: 'Problems with the server'})
}

module.exports = router