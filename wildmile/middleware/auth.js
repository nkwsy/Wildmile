import nextConnect from 'next-connect'
import passport from '../lib/passport'
import session from '../lib/session'
import dbConnect from '../lib/dbConnect'


const auth = nextConnect()
  .use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.TOKEN_SECRET,
      cookie: { maxAge: 1209600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax', }, // Two weeks in milliseconds
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    })
  )
  .use(async (req, res, next) => {
    await dbConnect()
  })
  .use(passport.initialize())
  .use(passport.session())

export default auth
