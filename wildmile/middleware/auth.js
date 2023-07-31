import nextConnect from 'next-connect'
import passport from '../lib/passport'
import session from '../lib/session'
import dbConnect from '../lib/dbConnect'
import MongoStore from 'connect-mongo'

const auth = nextConnect()
  .use(async (req, res, next) => {
    await dbConnect()
    next()
  })
  .use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.TOKEN_SECRET,
      cookie: {
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Two weeks in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      }, 
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    })
  )
  .use(passport.initialize())
  .use(passport.session())

export default auth
