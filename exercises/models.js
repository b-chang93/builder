'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const exerciseSchema = mongoose.Schema({
  id: String,
  name: String,
  title: String,
  primer: String,
  type: String,
  primary: [String],
  secondary: [String],
  equipment: [String],
  steps: [String],
  tips: [String],
  references: [String],
  svg: [String],
  png: [String]
});

const creatorSchema = mongoose.Schema({
  creator: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  }
});

exerciseSchema.methods.serialize = function() {
  return {
    id: this.id,
    name: this.name,
    title: this.title,
    primer: this.primer,
    type: this.type,
    primary: this.primary,
    secondary: this.secondary,
    equipment: this.equipment,
    steps: this.steps,
    tips: this.tips,
    references: this.references,
    svg: this.svg,
    png: this.png
  };
};

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;
