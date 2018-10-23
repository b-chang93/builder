const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Workout = require('./models');
const mongoose = require('mongoose')

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res) => {
  Workout
    .find()
    .then(workouts => {
      res.json(workouts.map(workout => workout.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/:id', (req, res) => {
  Workout
    .findById(req.params.id)
    .then(workout => {
      res.json(workout.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500),json({error: 'Something went horribly wrong.'})
    })
});

router.post('/', jwtAuth, (req, res, next) => {
  const requiredFields = ['title', 'difficulty', 'exercises', 'creator'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).json(message);
    }
  });

  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    console.log('Object missing');
  }

  let workout = {
    title: req.body.title,
    difficulty: req.body.difficulty,
    exercises: req.body.exercises,
    creator: req.user.id
  }

  for (var key in workout) {
    if(workout[key] == ''  || workout[key] == null) {
      const message = `Missing input for \`${key}\` in request body. Please add an input.`;
      console.error(message);
      return res.status(400).json(message);
    }
  }

  Workout
    .create({
      title: req.body.title,
      difficulty: req.body.difficulty,
      exercises: req.body.exercises,
      creator: req.user.id
    })
    .then(workout => res.status(201).json(workout.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

router.delete('/:id', (req, res) => {
  Workout
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Sucessfully deleted'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const message = `The 'id' is not valid`;
    console.error(message);
    return res.status(400).json(message);
  }

  const updated = {};
  const updateableFields = ['title', 'difficulty', 'exercises'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Workout
    .findByIdAndUpdate(req.params.id, {$set: updated}, { new: true})
    .then(updatedWorkout => res.json(updatedWorkout.serialize()))
    .catch(err => res.status(500).json({message: `Something went horribly wrong`}));
});

module.exports = {router};
