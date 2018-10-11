'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  avatar: String,
  currentSplit: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutSplit'},
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users'}]
});

UserSchema.methods.serialize = function() {
  return {
    id: this.id,
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    avatar: this.avatar || '',
    workoutSplit: this.workoutSplit,
    posts: this.posts,
    followers: this.followers,
    following: this.following
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('Users', UserSchema);

module.exports = {User};
