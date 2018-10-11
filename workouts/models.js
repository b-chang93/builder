'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const exerciseSchema = mongoose.Schema({
  name: {type: String, required: true},
  sets: {type: String, required: true},
  reps: {type: String, required: true}
});

const workoutSchema = mongoose.Schema({
  title: {type: String, required: true},
  difficulty: {type: String},
  workout: [exerciseSchema],
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
  // const workout = Object.assign({}, this.workout[0]._doc) //._doc accesses the raw data of mongo
  let fullWorkout = [];
  for(let i = 0; i < this.workout.length; i++) {
    let workout = this.workout[i]._doc
    fullWorkout.push(`${workout.name}: ${workout.sets} sets ${workout.reps} reps`);
  }
  return fullWorkout;
});

workoutSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    difficulty: this.difficulty,
    workout: this.readWorkout,
    creator: {
      id: this.creator.id,
      name: this.fullName
    }
  }
}
let Workout = mongoose.model('Workouts', workoutSchema);
module.exports = {Workout};
