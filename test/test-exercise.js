'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {Exercise} = require('../exercises/models');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
const faker = require('faker');

chai.use(chaiHttp);

function seedExerciseData() {
  console.log('Seeding exercises into db...');
  const seedData = [];

  for (let i=1; i <= 10; i++) {
    seedData.push({
      name: faker.lorem.sentence,
      description: faker.lorem.paragraph,
      muscleGroup: {
        main: faker.lorem.words,
        secondary: [faker.lorem.words]
      },
      equipment: [faker.lorem.words],
    })
  }
  return Exercise.insertMany(seedData);
};

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
};


describe('API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedExerciseData();
  })

  afterEach(function() {
    return tearDownDb();
  })

  after(function() {
    return closeServer();
  });

  it('should connect to root url', function() {
    return chai.request(app)
      .get('/')
      .then(res => {
        expect(res).to.have.status(200);
      })
  })

  describe('GET endpoint', function() {

    it('should return all exercises in db', function() {
      let resExercise;
      return chai.request(app)
        .get('/exercises')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          const expectedKeys = ['id', 'name', 'description', 'muscleGroup', 'equipment'];
          res.body.forEach(key => {
            expect(key).to.be.a('object');
            expect(key).to.include.keys(expectedKeys);
          });
          resExercise = res.body[0];
          return Exercise.findById(resExercise.id);
        })
        .then(exercise => {
          expect(resExercise.id).to.equal(exercise.id);
          expect(resExercise.name).to.equal(exercise.name);
          expect(resExercise.description).to.equal(exercise.description);
          expect(resExercise.muscleGroup.main).to.equal(exercise.muscleGroup.main);
          expect(resExercise.muscleGroup.secondary).to.deep.equal(exercise.muscleGroup.secondary);
          expect(resExercise.equipment).to.deep.equal(exercise.equipment);
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
            .then(res => {
              expect(res).to.have.status(200);
              expect(res).to.be.a.json;
              expect(res.body).to.be.a('object');
              expect(res.body.id).to.equal(exercise.id);
              expect(res.body.name).to.equal(exercise.name);
              expect(res.body.description).to.equal(exercise.description);
            })
        })

    })

  });

  describe('POST endpoint', function() {

    it('should add a new exercise', function() {
      const newExercise = {
        name: 'New Exercise',
        description: 'Description for a new exercise',
        muscleGroup: {
          main: 'main muscle',
          secondary: ['secondary muscle', 'secondary muscle-1']
        },
        equipment: ['equipment-1', 'equipment-1']
      };

      return chai.request(app)
        .post('/exercises')
        .send(newExercise)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.a.json;
          expect(res.body).to.be.a('object');
          const expectedKeys = ['id', 'name', 'description', 'muscleGroup', 'equipment'];
          expect(res.body).to.include.keys(expectedKeys);
          expect(res.body.id).to.not.be.null;
          expect(res.body.name).to.equal(newExercise.name);
          expect(res.body.description).to.equal(newExercise.description);
          expect(res.body.muscleGroup.main).to.equal(newExercise.muscleGroup.main);
          expect(res.body.muscleGroup.secondary).to.deep.equal(newExercise.muscleGroup.secondary);
          expect(res.body.equipment).to.deep.equal(newExercise.equipment);
        })
    });
  });

  describe('DELETE endpoint', function() {

    it('should delete a single exercise', function() {
      let exercise;
      return Exercise
        .findOne()
        .then(_exercise => {
          exercise = _exercise;

          return chai.request(app)
            .delete(`/exercises/${exercise.id}`)
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Exercise.findById(exercise.id);
        })
        .then(_post => {
          expect(_post).to.not.exist;
        })
    });
  });
});
