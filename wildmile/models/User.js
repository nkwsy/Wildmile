import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,

  tokens: Array,
  admin: { type: Boolean, default: false },
  ranger: Boolean,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

  profile: {
    name: String,
    gender: String,
    location: String,
    zipcode: String,
    phone: String,
    website: String,
    picture: Buffer
  }
}, { timestamps: true })

/**
 * Password hash middleware.
 */
UserSchema.pre('save', async function (next) {
  // check if password is present and is modified.
  try {
    if (this.password && this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10))
    }
    next()
  } catch (err) {
    next(err)
  }
})

/**
 * Helper method for validating user's password.
 */
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword, cb) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
