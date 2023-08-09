import nextConnect from 'next-connect'
import auth from '../../middleware/auth'
import passport from '../../config/passport'
import NextConnectOptions from '../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler
  .use(auth)
  .post(passport.authenticate('local'), (req, res) => {
    const { email, ranger, admin, user_profile } = req.user
    const profile = {
      name: '',
      website: '',
      gender: '',
      location: ''
    }
    return res.json({ user: { email, ranger: ranger || false, admin, profile: { ...profile, ...user_profile } } })
  })

export default handler