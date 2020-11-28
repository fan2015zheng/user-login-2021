const Utils = {
  ValidateEmailFormat: (email)=>{
    if(!email) return false
    if(typeof(email)!=='string') return false
    if(email !== email.trim()) return false
    const a = email.split('@')
    if(a.length !== 2) return false
    if(!a[0]) return false
    if(!a[1]) return false
    const b = a[1].split(".")
    if(b.length !== 2) return false
    if(!b[0]) return false
    if(!b[1]) return false
    return true
  },
  ValidatePasswordFormat: (pass)=>{
    if(!pass) return false
    if(typeof(pass)!=='string') return false
    if(pass !== pass.trim()) return false
    if(pass.length <8) return false
    return true
  },
  Domain: ()=> {
    if(process.env.heroku) {
      return "https://login2021.herokuapp.com"
    } else {
      return "http://localhost:5000"
    }
  }
}

module.exports = Utils