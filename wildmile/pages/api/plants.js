import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import { getAllPlants, createPlant } from '../../lib/db/plants'
import NextConnectOptions from '../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

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
    res.json({ users: await getAllPlants() })
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
  .post(async (req, res) => {
    // try {
    //   await userValidationSchema.validate(req.body, { abortEarly: false })
    // } catch (error) {
    //   return res.status(400).send(error.message)
    // }

    // // Here you check if the email has already been used
    // if (!!await findUserByEmail(req.body.email)) {
    //   return res.status(409).send('The email has already been used')
    // }
    // console.log('creating user')
    // const user = await createUser(req.body)
    // console.log("created user")
    // req.logIn(user, (err) => {
    //   if (err) throw err
    //   // Log the signed up user in
    //   res.status(201).json({
    //     user,
    //   })
    // })
  })

  export default handler
