const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Workout} = require('./models');
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
      // const err = new Error(`Missing \`${field}\` in request body`);
      // err.status = 400;
      // return next(err);
    }
  });

  // const nameRequired = ['firstName', 'lastName'];
  // nameRequired.forEach(field => {
  //   if(!(field in req.body.creator)) {
  //     const message = `Missing \`${field}\` in request body`;
  //     console.error(message);
  //     return res.status(400).send(message);
  //   }
  // })
  // if (req.body.length < 1) {
  //   const message = `There must be at least one field in request body`;
  //   console.error(message);
  //   return res.status(400).send(message);
  // }

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
  // if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  //   res.status(400).json({
  //     error: 'Request path id and request body id values must match'
  //   });
  // }
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
