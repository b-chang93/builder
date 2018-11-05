'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const User = require('../users/models');
const Exercise = require('../exercises/models');
const {TEST_BUILDER_DATABASE} = require('../config');
const {JWT_SECRET} = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
const exerciseData = require('../seed-data/exercise-seed-data.json');
const userData = require('../seed-data/users-seed-data.json');

chai.use(chaiHttp);


function seedExerciseData() {
  console.log('Seeding exercises into db...');
  return Exercise.insertMany(exerciseData);
};

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
};


describe('API resource', function() {
  let user = {};
  let token;

  before(function() {
    return runServer(TEST_BUILDER_DATABASE);
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(userData),
      Exercise.insertMany(exerciseData)
    ])
    .then(([users])=> {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
    });
  });

  afterEach(function () {
    tearDownDb();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all exercises in db', function() {
      let resExercise;
      return chai.request(app)
        .get('/exercises')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          expect(res.body.length).to.equal(289);

          const expectedKeys = ['id', 'name', 'equipment', 'png', 'primary', 'primer', 'references', 'secondary', 'steps', 'svg', 'tips', 'title', 'type'];
          res.body.forEach(key => {
            expect(key).to.be.a('object');
            expect(key).to.include.keys(expectedKeys);
          });
        })
    });

    it('should return a single exercise when using id', function() {
      let exercise;
      return Exercise
        .findOne()
        .then(_exercise => {
          exercise = _exercise;

          return chai.request(app)
            .get(`/exercises/${exercise.id}`)
            .set('authorization', `Bearer ${token}`)
            .then(res => {
              expect(res).to.have.status(200);
              expect(res).to.be.a.json;
              expect(res.body).to.be.a('object');
              expect(res.body.id).to.equal(exercise.id);
              expect(res.body.name).to.equal(exercise.name);
              expect(res.body.title).to.equal(exercise.title);
              expect(res.body.description).to.equal(exercise.description);
              expect(res.body.steps).to.be.a('array')
              expect(res.body.steps[0]).to.equal(exercise.steps[0]);
              expect(res.body.primer).to.equal(exercise.primer);
              expect(res.body.primary[0]).to.equal(exercise.primary[0]);
              expect(res.body.secondary[0]).to.equal(exercise.secondary[0]);
              expect(res.body.png[0]).to.equal(exercise.png[0]);
              expect(res.body.svg[0]).to.equal(exercise.svg[0]);
            })
        })
    })

    it('should return related exercises when searching by body part', function() {
      let exercise;
      return chai.request(app)
        .get(`/exercises/bodypart/deltoid`)
        .set('authorization', `Bearer ${token}`)
        expect(res).to.have.status(200);
        expect(res).to.be.a.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        expect(res.body.primary).to.include('deltoid')
      })
    })
});
