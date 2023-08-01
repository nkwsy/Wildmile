import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import { getAllUsers } from '../../lib/db/user'
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
    res.json({ users: await getAllUsers() })
  })

  export default handler
