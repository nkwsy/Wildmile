import nextConnect from 'next-connect'
import userSchema from "../../validation/user"
import auth from '../../middleware/auth'
import { createUser, findUserByEmail, updateUserByEmail } from '../../lib/db/user'
import NextConnectOptions from '../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler
  .use(auth)
  .use(async (req, res, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get((req, res) => {
    if(req.user){
      const { email, ranger, admin, profile } = req.user
      return res.json({ user: { email, ranger: ranger || false, admin, profile } })
    }
    return res.json({})
  })
  .post(async (req, res) => {
    try {
      await userSchema.validate(req.body, { abortEarly: false })
    } catch (error) {
      return res.status(400).send(error.message)
    }

    // Here you check if the email has already been used
    if (!!await findUserByEmail(req.body.email)) {
      return res.status(409).send('The email has already been used')
    }
    const user = await createUser(req.body)
    req.logIn(user, (err) => {
      if (err) throw err
      // Log the signed up user in
      res.status(201).json({
        user,
      })
    })
  })
  .use(async (req, res, next) => {
    // handlers after this (PUT, DELETE) all require an authenticated user
    // This middleware to check if user is authenticated before continuing
    if (!req.user) {
      res.status(401).send('unauthenticated')
    } else {
      await next()
    }
  })
  .put((req, res) => {
    const { name, gender, location, picture} = req.body
    const user = updateUserByEmail(req, req.user.email, { name: name, gender: gender, location: location, picture: picture })
    return res.json({ user })
  })

  export default handler