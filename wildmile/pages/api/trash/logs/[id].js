import nextConnect from 'next-connect'
// import userValidationSchema from "../../validation/user"
import auth from '../../../../middleware/auth'
import { getLogByID, updateLogByID } from '../../../../lib/db/trash'
import NextConnectOptions from '../../../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler
  .use(auth)
  .use(async (req, res, next) => {
    const start = Date.now()
    await next() // call next in chain
    const end = Date.now()
    console.log(`Request took ${end - start}ms`)
  })
  .get((req, res) => {
    const log = getLogByID(req.query.id)
    return res.json({log})
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
    const { avar } = req.body
    const log = updateLogByID(req, req.query.id, { avar })
    return res.json({ log })
  })

  export default handler