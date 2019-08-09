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
    const { _id } = req.locals.user;
    const { nickname } = req.query
    const exp = new RegExp(`^${nickname}`, 'gi')
    try {
        const users = await User.find(
            { nickname: exp }, 
            { nickname: 1, _id: 1 }
        )
        // Take out the one who's looking
        const filtered = users.filter(user => user._id === _id);
        res.status(200).send(filtered)
    } catch (err) {
        console.log(err)
        errorHandler(err, res)
    }
})

router.post('/add', async (req, res) => {
    const { _id } = res.locals.user
    const { nickname } = req.body
    try {
        const contact = await User.findOne({ nickname })
        if (!contact) {
            return res.status(404).send({ msg: 'User not found'})
        }
        const { _id: contact_id, player_id } = contact
        const status = false
        const user = await User.findByIdAndUpdate(
            _id,
            { $addToSet: { contacts: { _id: contact_id, nickname, status } } },
            { safe: true, upsert: true, new: true }
        )

        const notification = {
            contents: {
                en: `${user.nickname} wants to be part of your friends`
            },
            data: {
                contactId: _id,
                date: new Date(),
                code: 38
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

router.put('/delete', async (req, res) => {
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

router.post('/accept', async (req, res) => {
    const { _id } = res.locals.user
    const { contactId } = req.body
    const status = true
    try {
        // The one who sent the invitation
        const user1 = await User.findOneAndUpdate(
            { _id: contactId, "contacts._id": _id }, 
            { 
                $set: { "contacts.$.status": status },
            },
            { safe: true, upsert: true, new: true }
        )
        // The one who's accepting the invitation
        const user2 = await User.findByIdAndUpdate(
            _id,
            { $addToSet: { contacts: { _id: user1._id, nickname: user1.nickname, status } } },
            { safe: true, upsert: true, new: true }
        )
        res.status(200).send({ 
            nickname: user1.nickname,
            contactId: user1._id,
            status: true
        })
        const notification = {
            contents: {
                en: `${user2.nickname} accepted your invitation.`
            },
            data: {
                contact: {
                    contactId: user2._id,
                    nickname: user2.nickname,
                    status: true,
                },
                code: 31,
                date: new Date()
            },
            player_ids: [user1.player_id]
        }
        await newNotification(notification)
    } catch (err) {
        if (err.errmsg === 'The positional operator did not find the match needed from the query.') {
            res.status(404).send({ msg: 'Imposible to accept an unexistent invitation.' })
        }
        errorHandler(err, res)
    }
})

const errorHandler = (err, res) =>  {
    console.log(err)
    res.status(502).send({ msg: 'Problems with the server'})
}

module.exports = router