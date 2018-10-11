const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {WorkoutSplit} = require('./models');

router.get('/', (req, res) => {
  WorkoutSplit
    .find()
    .then(schedule => {
      console.log('SCANNING WORKOUTSPLIT DB...')
      console.log(schedule[0].name)
      console.log('FINISHED SCANNING WORKOUTSPLIT DB...')
      // res.json(schedule.map(split => split.serialize()));
      res.json(schedule)
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/:id', (req, res) => {
  WorkoutSplit
    .findById(req.params.id)
    .then(schedule => {
      console.log(schedule)
      res.json(schedule);
    })
    .catch(err => {
      console.error(err);
      res.status(500),json({error: 'Something went horribly wrong.'})
    })
});


router.post('/', (req,res) => {
  const requiredFields = ['name', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'creator'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
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

  WorkoutSplit
    .create({
      name: req.body.name,
      Monday: req.body.Monday,
      Tuesday: req.body.Tuesday,
      Wednesday: req.body.Wednesday,
      Thursday: req.body.Thursday,
      Friday: req.body.Friday,
      Saturday: req.body.Saturday,
      Sunday: req.body.Sunday,
      creator: req.user.id
    })
    .then(split => res.status(201).json(split.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

router.delete('/:id', (req, res) => {
  WorkoutSplit
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Sucessfully deleted'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});
//
// router.put('/:id', (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       error: 'Request path id and request body id values must match'
//     });
//   }
//
//   const updated = {};
//   const updateableFields = ['title', 'workout'];
//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });
//
//   Workout
//     .findByIdAndUpdate(req.params.id, {$set: updated}, { new: true})
//     .then(updatedWorkout => res.status(204).json(updatedWorkout.serialize()))
//     .catch(err => res.status(500).json({message: `Something went horribly wrong`}));
// });

module.exports = {router};
