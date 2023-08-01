import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import passport from '../../config/passport'
import NextConnectOptions from '../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler
  .use(auth)
  .post(passport.authenticate('local'), (req, res) => {
    return res.json({ user: req.user })
  })

  export default handler