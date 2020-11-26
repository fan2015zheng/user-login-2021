const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const Utils = require('./Utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middle/auth')

router.get('/haha/:id', auth, (req, res, next) => {
  res.json({message:"good"})
  
})

router.post('/login',(req, res, next)=> {
  const email = req.body.email
  const password = req.body.password
  if(!Utils.ValidateEmailFormat(email)) {
    res.json({
      ok: false,
      error: 'Login failed.'
    })
    return
  }

  User.findOne({email: email.toLowerCase()})
    .exec()
    .then((user)=>{
      if(!user) {
        res.json({ok:false, error: 'Login failed.'})
        return
      }
      bcrypt.compare(password, user.password, (err, isMatch)=>{
        if(err) {
          res.status(500).json({ok:false, error: 'Login failed.'})
          return
        }
        if(!isMatch) {
          res.json({ok:false, error: 'Login failed.'})
        return
        }
        
        const token = jwt.sign({
          email: user.email,
          _id: user._id
        },process.env.JWT_SECRET,{
          expiresIn: '1d'
        })

        res.json({
          ok:true,
          token: token
        })
      })

    })
    .catch((err)=>{res.status(500).json({ok: false,error: err})})
})

router.post('/create', (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  console.log(Utils.ValidateEmailFormat(email) + "+"+Utils.ValidatePasswordFormat(password))
  
  if(!Utils.ValidateEmailFormat(email) || !Utils.ValidatePasswordFormat(password)) {
    res.json({
      ok: false,
      error: 'Email or password is rejected.'
    })
    return
  }

  User.findOne({email: email.toLowerCase()})
    .exec()
    .then(
      (foundUser)=>{
        if(foundUser) {
          res.json({ok:false, error: 'The email already exists.'})
          return
        }
        bcrypt.hash(password,10,(err, hash)=>{
          if(err) {
            res.status(500).json({ok:false, error: err})
            return
          }
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: email.toLowerCase(),
            password: hash
          })
          user
          .save()
          .then(()=>{
            res.json({
              ok: true,
              email: email
            })
          })
          .catch((err)=>{res.status(500).json({ok: false,error: err})})
        })
      }
    )
    .catch((err)=>{res.status(500).json({ok: false,error: err})})
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