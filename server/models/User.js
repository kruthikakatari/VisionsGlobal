import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false // Do not return password by default
    },
    role: {
      type: String,
      // 'student' added by Member 3: Assignment/Submission (P3's modules)
      // need a real, logged-in student actor. Students have no credentials
      // of their own in the Student model, so a student logs in with just
      // their Student profile id (server/controllers/studentAuthController.js,
      // itself a P3 placeholder pending a real credential system), which
      // finds-or-creates a User here with role 'student' and studentProfile
      // set. Everywhere else in the app, 'student' is not a selectable
      // registration role (see authController.js register()).
      enum: ['educator', 'leadership', 'parent', 'student'],
      default: 'educator'
    },
    // Only set for role: 'student' — links this login identity back to the
    // actual Student profile record (personal/academic/family info).
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
export default User;
