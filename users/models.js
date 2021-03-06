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
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

UserSchema.methods.serialize = function() {
  return {
    _id: this._id,
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

const User = mongoose.model('User', UserSchema);

module.exports = User;
