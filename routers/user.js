const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const Utils = require('./Utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middle/auth')
const nodemailer = require('nodemailer')

router.get('/isLoggedIn', auth, (req, res, next) => {
  if(!req.userData) {
    res.json({ok:false})
    return
  }
  res.json({ok:true})
})

router.get('/logout',auth, (req, res, next) => {
  res.cookie("access-token","deleted",{
    maxAge: -24*60*60*1000,
    secure: true,   //Chrome only allow https for sameSite=None
    sameSite: "None",  //accept 3rd party cookies
    httpOnly: true
  })
  res.end()
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
        if(!user.isEmailConfirmed) {
          res.json({ok:false, error: 'Please confirm email before login'})
          return
        }
        
        const token = jwt.sign({
          email: user.email,
          _id: user._id
        },process.env.JWT_SECRET,{
          expiresIn: '1d'
        })
        res.cookie("access-token",token,{
          maxAge: 24*60*60*1000,
          secure: true,   //Chrome only allow https for sameSite=None
          sameSite: "None",  //accept 3rd party cookies
          httpOnly: true
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
            sendEmail(email)
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

router.get('/confirm/:token',(req, res, next)=> {
  const token = req.params.token
  try {
    const oUser = jwt.verify(token, process.env.GMAIL_SECRET)
    const email = oUser.email
    User.findOne({email:email.toLowerCase()})
      .exec()
      .then((user)=>{
        user.isEmailConfirmed = true
        user.save()
        res.send({ok:true})
      })
      .catch((err)=>{res.send({ok:false})})
  } catch (e) {
    res.send("Cannot confirm email.")
  }
})

module.exports = router


function sendEmail(toEmail) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GPASS
    }
  })

  jwt.sign({email: toEmail},process.env.GMAIL_SECRET,
   { expiresIn: '1d'}, (err, token)=> {

      const url = `${Utils.Domain()}/user/confirm/${token}`
      transporter.sendMail({
        from: process.env.GMAIL,
        to: toEmail,
        subject: 'Write a Letter to a Friend',
        html: `<a href="${url}">Verify your write a letter account</a>`
      })
   }
  )
}