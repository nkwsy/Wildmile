import User from '../models/User'

export function getAllUsers(req) {
  // For demo purpose only. You are not likely to have to return all users.
  return User.find({})
}

export async function createUser(req, { email, password, name }) {
  // Here you should create the user and save the salt and hashed password (some dbs may have
  // authentication methods that will do it for you so you don't have to worry about it):

  // Here you should insert the user into the database
  let user = User.create({
    email: username,
    password,
    profile: {
      name: name
    }
  })
  req.session.users.push(user)
}

export function findUserByUsername(req, email) {
  // Here you find the user based on id/username in the database
  return User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err) }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` })
    }
    return done(null, user)
  })
}

export function updateUserByUsername(req, username, update) {
  // Here you update the user based on id/username in the database
  return User.find({ email: username.toLowerCase() }, (err, user) => {
    if (err) { return next(err) }
    user.email = req.body.email || ''
    user.profile.name = req.body.name || ''
    user.profile.gender = req.body.gender || ''
    user.profile.location = req.body.location || ''
    user.profile.website = req.body.website || ''
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' })
        }
        return next(err)
      }
    })
    return done(null, user)
  })
}

