const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const Utils = require('./Utils')
const bcrypt = require('bcrypt')

router.get('/:id', (req, res, next) => {
  const id = req.params.id
  User.findById(id)
    .exec()
    .then((user)=>{
      res.status(200).json(user)
    })
    .catch((err)=>{res.status(500).json({error: err})})
})

router.post('/create', (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  if(!Utils.ValidateEmailFormat(email) || !Utils.ValidatePasswordFormat(password)) {
    res.json({
      ok: false,
      error: 'Email or password is rejected.'
    })
    return
  }
  User.findOne({email: email.toLowerCase()},(err, foundUser)=>{
    if(err) {
      res.status(500).json({ok:false, error: err})
      return
    } 
    if(foundUser) {
      res.json({ok:false, error: 'The email already exists.'})
      return
    }
    bcrypt.hash(password,10,(err, hash)=>{
      if(err) {
        res.status(500).json({ok:false, error: err})
        return
      } else {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: email.toLowerCase(),
          password: hash
        })
        
        user
        .save()
        .then((result)=> {
          res.json({
            ok: true,
            user: user
        })
      })
      .catch((err)=>{
        res.status(500).json({ok: false,error: err})})
      }
    })
  })
})

router.patch('/:id',(req, res, next)=> {
  const id = req.params.id
  User.findById(id)
    .exec()
    .then((user)=>{
      console.log(user)
      res.status(200).json(user)
    })
    .catch((err)=>{res.status(500).json({error: err})})
})

router.delete('/:id',(req, res, next)=> {
  const id = req.params.id
  res.status(200).json({
    message: `DELETE /user/${id}`
  })
})

module.exports = router