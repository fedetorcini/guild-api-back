const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  displayName: {
    type: String,
    trim: true,
    default: null
  },
  fullName: {
    type: String,
    trim: true,
    default: null
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: null
  },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and ensure id field is present
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  // Ensure id field is present (Mongoose virtual, but make it explicit)
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;

  //obj.followersCount = obj.followers?.length || 0;
  //obj.followingCount = obj.following?.length || 0;
  return obj;
};

// --- PERFIL PUBLICO ---
userSchema.methods.toPublicProfile = function (isFollowing = false) {
  return {
    id: this._id,
    username: this.username,

    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,

    isFollowing, // opcional
  };
};


module.exports = mongoose.model('User', userSchema);

