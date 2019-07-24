const User = require('../model/User.model')

const emailValidation = (email, nickname) => new Promise(async (resolve, reject) => {
  try {
    const emailResult = await User.find({ email })
    const nickResult = await User.find({ nickname })
    if (emailResult.length > 0) {
      return reject('email')
    }
    if (nickResult.length > 0) {
      return reject('nickname')
    }
    return resolve(true)
  } catch (err) {
    console.log(err)
    return resolve(true)
  }
})

module.exports = emailValidation
