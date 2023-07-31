import passport from 'passport'
import LocalStrategy from 'passport-local'
import { findUserByEmail } from './db'

passport.serializeUser((user, done) => {
  done(null, user.email)
})

passport.deserializeUser(function (email, done) {
  // deserialize the email back into user object
  findUserByEmail(email).then(user => {
    done(null, user)
  })
})

/**
 * Sign in using Email and Password.
 */

passport.use(
  new LocalStrategy(
    (email, password, done) => {
      // Here you lookup the user in your DB and compare the password/hashed password
      const user = findUserByEmail(email)
      if (!user) {
        return done(null, false, { msg: `Email ${email} not found.` })
      }

      if (!user.comparePassword(password)) {
        return done(null, false, { msg: 'Invalid email or password.' })
      } else {
        return done(null, user)
      }
    }
  )
)

export default passport
