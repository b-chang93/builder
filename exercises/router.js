const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Exercise = require('./models');

router.get('/', (req,res) => {
  Exercise
    .find()
    .then(exercises => {
      res.json(exercises.map(exercise => exercise.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/:id', (req, res) => {
  Exercise
    .find({"id": `${req.params.id}`})
    .then(exercise => res.json(exercise[0].serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/bodypart/:muscle?', (req, res) => {
  Exercise
    .find()
    .then(exercises => {
      let result = exercises.filter(muscle => muscle.primary[0] === req.params.muscle)
      res.json(result.map(muscle => muscle.serialize()))
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});
module.exports = router;
