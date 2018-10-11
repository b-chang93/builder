'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const exerciseSchema = mongoose.Schema({
  id: {type: String, required: true},
  name: {type: String, required: true},
  title: {type: String, required: true},
  primer: {type: String, required: true},
  type: {type: String, required: true},
  primary: [{type: String, required: true}],
  secondary: [String],
  equipment: [{type: String, required: true}],
  steps: [{type: String, required: true}],
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

const Exercise = mongoose.model('Exercises', exerciseSchema);
module.exports = {Exercise};
