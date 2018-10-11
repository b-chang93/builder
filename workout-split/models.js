'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const workoutSplitSchema = mongoose.Schema({
  name: {type: String, required: true},
  Monday: {type: String, required: true},
  Tuesday: {type: String, required: true},
  Wednesday: {type: String, required: true},
  Thursday: {type: String, required: true},
  Friday: {type: String, required: true},
  Saturday: {type: String, required: true},
  Sunday: {type: String, required: true},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'}
  // workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout'},
  // day: String,
  // description: String
})

// const workoutSplitSchema = mongoose.Schema({
//   schedule: {
//     workoutSplit : {
//       name: {type: String, required: true},
//       Monday: {type: String, required: true},
//       Tuesday: {type: String, required: true},
//       Wednesday: {type: String, required: true},
//       Thursday: {type: String, required: true},
//       Friday: {type: String, required: true},
//       Saturday: {type: String, required: true},
//       Sunday: {type: String, required: true},
//       // creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'}
//     }
//   }
// })

workoutSplitSchema.methods.serialize = function() {
  return {
    id: this.id,
    workoutSplit: workoutSplitSchema
  }
};


let WorkoutSplit = mongoose.model('Workoutsplit', workoutSplitSchema);
module.exports = {WorkoutSplit};
