import User from '../models/User'

export async function getAllUsers() {
  // For demo purpose only. You are not likely to have to return all users.
  return await User.find({})
}

export async function createUser(email, password, name) {
  // Here you should create the user and save the salt and hashed password (some dbs may have
  // authentication methods that will do it for you so you don't have to worry about it):

  // Here you should insert the user into the database
  const user = await User.create({
    email: email,
    password,
    profile: {
      name: name
    }
  })
  return user
}

export async function findUserByEmail(email) {
  // Here you find the user based on id/email in the database
  console.log(email)
  return await User.findOne({ email: email.toLowerCase() })
}

export async function updateUserByEmail(req, email, update) {
  // Here you update the user based on id/email in the database
  console.log(email)
  const user = await User.find({ email: email.toLowerCase() })
  
  if(user){
    user.email = req.body.email || ''
    user.profile.name = req.body.name || ''
    await user.save()
  }
  return user
}

