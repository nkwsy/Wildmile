import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import NextConnectOptions from '../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler.use(auth).get((req, res) => {
  req.logOut()
  res.status(204).end()
})

export default handler