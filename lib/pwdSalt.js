const bcrypt = require('bcrypt')

const pwdSalt = password => new Promise((resolve, reject) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return reject(err)
    }
    bcrypt.hash(password, salt, (error, hash) => {
      if (error) {
        return reject(error)
      }
      return resolve(hash)
    })
  })
})

module.exports = pwdSalt