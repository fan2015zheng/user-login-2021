const mongoose = require('mongoose')
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  isEmailConfirmed: Boolean
})

module.exports = mongoose.model('User',schema)