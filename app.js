const express = require('express')
const app = express()
const userRouter = require('./routers/user')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

if(!process.env.heroku) {
  dotenv.config()
}
const mongoUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@free2.kq8hz.mongodb.net/Login?retryWrites=true&w=majority`
mongoose.connect(mongoUrl,{ useNewUrlParser: true })

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//CORS
app.use((req, res, next)=>{
  //* can be replaced with 'http://uwmadison.org' but it only protect browser access but not postman etc
  res.header('Access-Control-Allow-Origin', '*')  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  //browser always send an 'options' request to see what type of http method it can request
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE,  GET')
    return res.status(200).json({})
  }
  next()
})

app.use('/user', userRouter)

//Error handling
app.use((req, res, next)=>{
  const error = new Error('Not found')
  error.status = 404
  next(error) // pass error object to next app.use() call
})

app.use((error, req, res, next)=>{
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message  //crash error usually has its own message
    }
  })
})

module.exports = app