'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const {Workout} = require('../workouts');
const User = require('../users/models');
const {TEST_BUILDER_DATABASE} = require('../config');
const {JWT_SECRET} = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
const workoutData = require('../seed-data/workout-seed-data.json');
const userData = require('../seed-data/users-seed-data.json');


chai.use(chaiHttp);

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
}

describe('API resource', function() {
  let user = {};
  let token;

  before(function () {
    return runServer(TEST_BUILDER_DATABASE);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(userData),
      Workout.insertMany(workoutData),
    ])
    .then(([users])=> {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
    });
  });

  afterEach(function () {
    tearDownDb();
  });

  describe('GET endpoint /workouts', function() {

    it('should return all workouts in db', function() {

      let resWorkout;
      return chai.request(app)
        .get('/workouts')
        .set('authorization', `Bearer ${token}`)
        .then(res => {

          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          const expectedKeys = ['id', 'title', 'difficulty', 'exercises', 'creator'];
          res.body.forEach(key => {
            expect(key).to.be.a('object');
            expect(key).to.include.keys(expectedKeys);
          });
        });
    });

    it('should return a single workout when searching by id', function() {
      let workout;

      return Workout.findOne()
        .then(_workout => {
          workout = _workout

          return chai.request(app)
            .get(`/workouts/${workout._id}`)
            .set('authorization', `Bearer ${token}`)
            .then(res => {
              expect(res).to.have.status(200);
              expect(res).to.be.a.json;
              expect(res.body.exercises).to.be.a('array');
              expect(res.body.exercises[0]).to.be.a('object');
              expect(res.body.exercises[0].sets).to.be.a('array');

              const expectedWorkoutKeys = ['id', 'title', 'difficulty', 'exercises', 'creator'];
              const expectedSetKeys = ['weight', 'reps']
              expect(res.body).to.include.keys(expectedWorkoutKeys)
              expect(res.body.exercises[0].sets[0]).to.include.keys(expectedSetKeys)
            })
        })
    });

  });

  describe("POST /workouts", function () {

    it("should create and return a new workout", function () {
      const newWorkout = {
          "creator": user._id,
          "title":"Test Workout",
          "difficulty":"Difficult",
          "exercises":[
            {
              "name":"Bench Press: Barbell",
              "sets":[
                {
                  "weight":185,
                  "reps":8},
                {
                  "weight":200,
                  "reps":5
                },
                {
                  "weight":225,
                  "reps":5
                },
                {
                  "weight":225,
                  "reps":5}
                ]
            },
            {
              "name":"Bench Press: Barbell (Incline)",
              "sets":[
                {
                  "weight":185,
                  "reps":5
                },
                {
                  "weight":190,
                  "reps":5
                },
                {
                  "weight":200,
                  "reps":5
                }
              ]
            }
          ]
        }
      let res;
      return chai.request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(newWorkout)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");

          const expectedWorkoutKeys = ['id', 'title', 'difficulty', 'exercises'];
          const expectedSetKeys = ['weight', 'reps']
          expect(res.body).to.include.keys(expectedWorkoutKeys)
          expect(res.body.exercises[0].sets[0]).to.include.keys(expectedSetKeys)
        });
    });

    it('should return an error when missing "title" field', function () {
      const newWorkout = {
          "difficulty":"foo",
          "exercises":[
            {
              "name":"foo",
              "sets":"foo"
            }
          ],
          "creator": user._id
        }
      let res;

      return chai.request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${token}`)
        .set('Content-Type', 'applicaton/json')
        .send(newWorkout)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.equal("Missing `title` in request body");
        });
    });
  });

  describe("PUT /workouts/:id", function () {

    it("should update the workout", function () {
      const updateItem = {
        "title": "update my workout #2",
        "difficulty": "intermediate",
        "exercises": [
          {
            "name":"Test Exercise",
            "sets": [
                {
                    "weight": 185,
                    "reps": 8
                }
              ]
          }
        ],
        "creator": user._id
      };
      let data;

      return Workout.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .put(`/workouts/${data._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.all.keys("id", "title", "difficulty", "exercises", "creator");
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.difficulty).to.equal(updateItem.difficulty);
        });
    });

    it("should respond with a 400 for an invalid id", function () {
      const badId = "NOT-A-VALID-ID";
      const updateItem = {
        "title": "update my workout #2",
        "difficulty": "intermediate",
        "exercises": [
          {
            "name":"Test Exercise",
            "sets": [
                {
                    "weight": 185,
                    "reps": 8
                }
              ]
          }
        ],
        "creator": user._id
      };

      return chai.request(app)
        .put(`/workouts/${badId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.eq("The 'id' is not valid");
        });
    });

    it("should respond with a 404 for an non existent id", function () {
      const updateItem = {
        "title": "update my workout #2",
        "difficulty": "intermediate",
        "exercises": [
          {
            "name":"Test Exercise",
            "sets": [
                {
                    "weight": 185,
                    "reps": 8
                }
              ]
          }
        ],
        "creator": user._id
      };

      return chai.request(app)
        .put("/workouts/DOESNOTEXIST")
        .set("Authorization", `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe("DELETE  /workouts/:id", function () {

    it("should delete an workout by id", function () {
      let data;

      return Workout
        .findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .delete(`/workouts/${data._id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;

          return Workout.findById(data._id);
        })
        .then((item) => {
          expect(item).to.be.null;
        });
    });
  });

});
