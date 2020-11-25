const mongoose = require('mongoose')
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {type: String, required: true, unique:true},
  password: {type: String, required: true},
  isEmailConfirmed: Boolean
})

module.exports = mongoose.model('User',schema)