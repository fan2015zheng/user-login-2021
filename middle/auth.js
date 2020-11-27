const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

  try {
    const token = req.cookies['access-token']
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userData = decoded
    next()
  } catch(err) {
    res.json({ok:false, error: 'Auth failed'})
    return
  }
}