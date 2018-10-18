'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const {Workout} = require('../workouts/models');
const {User} = require('../users/models');
const {TEST_BUILDR_DATABASE} = require('../config');
const JWT_SECRET = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
const faker = require('faker');
const workoutData = require('../seed-data/workout-seed-data.json');
const exerciseData = require('../seed-data/exercise-seed-data.json');

// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const jwtAuth = passport.authenticate('jwt', { session: false });

chai.use(chaiHttp);

// function generateSets() {
//   console.log('Generating sets...');
//   let exerciseList = [];
//
//   for(let i=1; i <=4; i++) {
//
//     let set = {
//       weight: faker.random.number({
//           'min': 1,
//           'max': 200
//       }),
//       reps: faker.random.number({
//           'min': 1,
//           'max': 20
//       })
//     }
//
//     exerciseList.push(set)
//   }
// }

// function seedWorkoutData(userid) {
//   console.log('Seeding exercises into db...');
//   const seedData = [];
//
//   for (let i=1; i <= 10; i++) {
//     seedData.push({
//       id: faker.random.number,
//       title: faker.lorem.sentence,
//       difficulty: faker.lorem.paragraph,
//       exercises:[
//         {
//           name: faker.lorem.sentence,
//           sets: [
//             {
//               weight: faker.random.number({
//                   'min': 1,
//                   'max': 200
//               }),
//               reps: faker.random.number({
//                   'min': 1,
//                   'max': 20
//               })
//             },
//             {
//               weight: faker.random.number({
//                   'min': 1,
//                   'max': 200
//               }),
//               reps: faker.random.number({
//                   'min': 1,
//                   'max': 20
//               })
//             },
//             {
//               weight: faker.random.number({
//                   'min': 1,
//                   'max': 200
//               }),
//               reps: faker.random.number({
//                   'min': 1,
//                   'max': 20
//               })
//             }
//           ]
//         }
//       ],
//       creator: {
//         id: userid
//       }
//     })
//   }
//   return Workout.insertMany(seedData);
// };
//
// function seedWorkoutData() {
//   console.log('Seeding workouts into db...');
//   console.log(JSON.stringify(workoutData))
//
//   return Workout.insertMany((workoutData));
// };

// function seedWorkoutData(userid) {
//   console.log('Seeding exercises into db...');
//   const seedData = [];
//
//     seedData.push({
//       // id: faker.random.number,
//       title: 'Workout Plan',
//       difficulty: 'Easy',
//       exercises:[
//         {
//           name: 'Bench Press',
//           sets: [
//             {
//               weight: 100,
//               reps: 15
//             }
//           ]
//         }
//       ],
//       creator: userid
//     })
//   return Workout.insertMany(seedData);
// };

function seedWorkoutData(userid) {
  console.log('Seeding exercises into db...');
  const seedData = [];
]2
  for(let i = 1; i <= g; i++) {
    seedData.push({
      // id: faker.random.number,
      title: faker.lorem.words(),
      difficulty: faker.lorem.word(),
      exercises:[
        {
          name: 'Bench Press',
          sets: [
            {
              weight: faker.random.number(),
              reps: faker.random.number()
            }
          ]
        }
      ],
      creator: userid
    })
  }
  // console.log(seedData)
  return Workout.insertMany(seedData);
};

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
};


describe('API resource', function() {

  const username = 'testUser1';
  const password = 'testPass1';
  const firstName = 'Test';
  const lastName = 'User';
  let token;

  before(function () {
    return runServer(TEST_BUILDR_DATABASE);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    )
    .then(user => {
      token = jwt.sign({user}, process.env.JWT_SECRET, {
            algorithm: 'HS256',
            subject: user.username
          });
      seedWorkoutData(user._id);
    })
  });

  afterEach(function () {
    // return Workout.remove({})
    // .then(() => User.remove({}))
    // User.remove({});
    tearDownDb();
  });

  // before(function() {
  //   return runServer(TEST_DATABASE_URL);
  // });
  //
  // beforeEach(function() {
  //   return seedWorkoutData();
  // })
  //
  // afterEach(function() {
  //   return tearDownDb();
  // })
  //
  // after(function() {
  //   return closeServer();
  // });

  // it('should connect to root url', function() {
  //   return chai.request(app)
  //     .get('/')
  //     .then(res => {
  //       expect(res).to.have.status(200);
  //     })
  // })

  describe('GET endpoint', function() {

    // it('should return all workouts in db', function() {
    //
    //   let resWorkout;
    //   return chai.request(app)
    //     .get('/workouts')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(res => {
    //       // console.log(res.body)
    //       expect(res).to.have.status(200);
    //       expect(res).to.be.a.json;
    //       expect(res.body).to.be.a('array');
    //       expect(res.body).to.have.lengthOf.at.least(1);
    //
    //       const expectedKeys = ['id', 'title', 'difficulty', 'exercises', 'creator'];
    //       res.body.forEach(key => {
    //         expect(key).to.be.a('object');
    //         expect(key).to.include.keys(expectedKeys);
    //       });
    //       // resWorkout = res.body[0];
    //       // console.log(resWorkout)
    //       // return Workout.findById(resWorkout.id);
    //     })
    //     // .then(workout => {
    //     //   expect(resWorkout.id).to.equal(workout.id);
    //     //   expect(resWorkout.title).to.equal(workout.title);
    //     //   expect(resWorkout.difficulty).to.equal(workout.difficulty);
    //     //   expect(workout.exercises).to.be.a('array');
    //     //   expect(resWorkout.exercises).to.equal(workout.exercises);
    //     // })
    // });

    it('should return a single exercise when using id', function() {
      let workoutInfo;
      return Workout
        .find()
        .then(_workoutInfo => {
          console.log(_workoutInfo)
          workoutInfo = _workoutInfo;
          console.log(workoutInfo)

          // return chai.request(app)
          //   .get(`/workouts/${workoutInfo}`)
          //   .set('authorization', `Bearer ${token}`)
          //   .then(res => {
          //     expect(res).to.have.status(200);
          //     expect(res).to.be.a.json;
          //     expect(res.body).to.be.a('object');
          //     expect(res.body.id).to.equal(exercise.id);
          //     expect(res.body.name).to.equal(exercise.name);
          //     expect(res.body.description).to.equal(exercise.description);
          //   })
        })

    })

  });

});

  // });
  //
  // describe('POST endpoint', function() {
  //
  //   it('should add a new workout', function() {
  //     // const newExercise = {
  //     //   title: 'New Workout Plan',
  //     //   difficulty: 'Hard',
  //     //   exercises:[
  //     //     {
  //     //       name: 'Bench Press',
  //     //       sets: [
  //     //         {
  //     //           weight: 100,
  //     //           reps: 15
  //     //     },
  //     //     {
  //     //       name: 'Incline Press',
  //     //       sets: [
  //     //         {
  //     //           weight: 100,
  //     //           reps: 15
  //     //     },
  //     //     {
  //     //       name: 'Decline Press',
  //     //       sets: [
  //     //         {
  //     //           weight: 100,
  //     //           reps: 15
  //     //         }
  //     //       ]
  //     //     }
  //     //   ],
  //     //   creator: userid
  //     // }
  //     const newExercise = {}
  //
  //     return chai.request(app)
  //       .post('/workouts')
  //       .send(newExercise)
  //       .then(function(res) {
  //         expect(res).to.have.status(201);
  //         // expect(res).to.be.a.json;
  //         // expect(res.body).to.be.a('object');
  //         // const expectedKeys = ['id', 'name', 'description', 'muscleGroup', 'equipment'];
  //         // expect(res.body).to.include.keys(expectedKeys);
  //         // expect(res.body.id).to.not.be.null;
  //         // expect(res.body.name).to.equal(newExercise.name);
  //         // expect(res.body.description).to.equal(newExercise.description);
  //         // expect(res.body.muscleGroup.main).to.equal(newExercise.muscleGroup.main);
  //         // expect(res.body.muscleGroup.secondary).to.deep.equal(newExercise.muscleGroup.secondary);
  //         // expect(res.body.equipment).to.deep.equal(newExercise.equipment);
  //       })
  //   });
  // });
  //
  // describe('DELETE endpoint', function() {
  //
  //   it('should delete a single exercise', function() {
  //     let exercise;
  //     return Exercise
  //       .findOne()
  //       .then(_exercise => {
  //         exercise = _exercise;
  //
  //         return chai.request(app)
  //           .delete(`/exercises/${exercise.id}`)
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(204);
  //         return Exercise.findById(exercise.id);
  //       })
  //       .then(_post => {
  //         expect(_post).to.not.exist;
  //       })
  //   });
  // });
