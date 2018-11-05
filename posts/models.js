'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: {type: Number, default: 0},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created: String
});

PostSchema.set("timestamps", true);

PostSchema.pre('find', function(next) {
  this.populate('creator');
  next();
})

PostSchema.pre('findOne', function(next) {
  this.populate('creator');
  next();
})

PostSchema.pre('save', function(next) {
  this.populate('creator');
  next();
})

PostSchema.virtual('fullName').get(function() {
  return `${this.creator.firstName} ${this.creator.lastName}`.trim();
})

PostSchema.methods.serialize = function() {
  return {
    _id: this._id,
    title: this.title,
    content: this.content,
    likes: this.likes,
    creator: this.creator,
    created: this.createdAt
  };
};

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
