'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const setSchema = mongoose.Schema({
  weight: Number,
  reps: Number
})

const exerciseSchema = mongoose.Schema({
  name: {type: String, required: true},
  sets: [setSchema]
});

const workoutSchema = mongoose.Schema({
  title: {type: String},
  difficulty: {type: String},
  exercises: [exerciseSchema],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});

workoutSchema.pre('find', function(next) {
  this.populate('creator');
  next();
})

workoutSchema.pre('findOne', function(next) {
  this.populate('creator');
  next();
})

workoutSchema.pre('save', function(next) {
  this.populate('creator').execPopulate();
  next();
})

workoutSchema.virtual('fullName').get(function(err) {
  return `${this.creator.firstName} ${this.creator.lastName}`.trim();
})

workoutSchema.virtual('readWorkout').get(function() {
  this.exercises.forEach(e => {
    let fullWorkout = {
      name: '',
      sets: [],
    }
    fullWorkout.name = e.name

    e.sets.forEach(s => {
      let set = {
        weight: '',
        reps: ''
      }

      set.weight = s.weight
      set.reps = s.reps
      fullWorkout.sets.push(`${set.weight} lb for ${set.reps} reps`);
    })
    console.log(fullWorkout)
    return fullWorkout;
  })
});

workoutSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    difficulty: this.difficulty,
    exercises: this.exercises,
    creator: {
      id: this.creator.id,
      name: this.fullName
    }
  }
}
let Workout = mongoose.model('Workouts', workoutSchema);
module.exports = {Workout};
