import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import { getAllUsers, createUser, findUserByEmail } from '../../lib/db'

const handler = nextConnect()

handler
  .use(auth)
  .use(async (req, event, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get(async (req, res) => {
    // For demo purpose only. You will never have an endpoint which returns all users.
    // Remove this in production
    res.json({ users: await getAllUsers() })
  })
  .post(async (req, res) => {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      return res.status(400).send('Missing fields')
    }
    // Here you check if the email has already been used
    const emailExisted = await findUserByEmail(email)
    console.log("Does email exist? " + !!emailExisted)
    if (!!emailExisted) {
      return res.status(409).send('The email has already been used')
    }
    console.log('creating user')
    const user = await createUser(email, password, name)
    console.log("Created User " + user)
    req.logIn(user, (err) => {
      if (err) throw err
      console.log("User is logged in")
      // Log the signed up user in
      res.status(201).json({
        user,
      })
    })
  })

export default handler
