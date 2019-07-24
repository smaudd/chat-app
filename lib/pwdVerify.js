const bcrypt = require('bcrypt')

const pwdVerify = (password, userPassword) => new Promise(async (resolve, reject) => {
  try {
    bcrypt.compare(password, userPassword, (err, isMatch) => {
      if (err) {
        throw err
      }
      if (isMatch) {
        return resolve(true)
      }
      // Wrong password
      return reject('Invalid Credentials')
    })
  } catch (err) {
    // Wrong email
    return reject('Invalid Credentials')
  }
})

module.exports = pwdVerify
