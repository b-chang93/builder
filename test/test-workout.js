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

function generateSets() {
  console.log('Generating sets...');
  let exerciseList = [];

  for(let i=1; i <=4; i++) {

    let set = {
      weight: faker.random.number({
          'min': 1,
          'max': 200
      }),
      reps: faker.random.number({
          'min': 1,
          'max': 20
      })
    }

    exerciseList.push(set)
  }
}

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

function seedWorkoutData(userid) {
  console.log('Seeding exercises into db...');
  console.log(userid)
  const seedData = [];

    seedData.push({
      id: faker.random.number,
      title: 'Workout Plan',
      difficulty: 'Easy',
      exercises:[
        {
          name: 'Bench Press',
          sets: [
            {
              weight: 100,
              reps: 15
            }
          ]
        }
      ],
      creator: {
        id: userid,
        firstName: 'Brandon',
        lastName: 'Chang'
      }
    })
  return Workout.insertMany(seedData);
};

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
};


describe('API resource', function() {

  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
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
      console.log(user._id)
      token = jwt.sign({user}, process.env.JWT_SECRET, {
            algorithm: 'HS256',
            subject: user.username
          });
      // console.log(token)
      seedWorkoutData(user._id);
      // seedWorkoutData();
      // Workout.find()
      // .then(workouts => {
      //   // console.log(workouts)
      // })
    })
  });

  afterEach(function () {
    return User.remove({});
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

    it('should return all workouts in db', function() {
      // return jwt.sign({user}, config.JWT_SECRET, {
      //   subject: user.username,
      //   expiresIn: config.JWT_EXPIRY,
      //   algorithm: 'HS256'
      // });
      //
      // const token = jwt.sign(
      //     {
      //       user: {
      //         username,
      //         firstName,
      //         lastName
      //       }
      //     },
      //     JWT_SECRET,
      //     {
      //       algorithm: 'HS256',
      //       subject: username,
      //       expiresIn: '7d'
      //     }
      //   );
      // const token = jwt.sign(
      //     {
      //       user: {
      //         username,
      //         firstName,
      //         lastName
      //       }
      //     },
      //     {secretOrKey: JWT_SECRET},
      //     {
      //       algorithm: 'HS256',
      //       subject: username,
      //       expiresIn: '7d'
      //     }
      //   );

      let resExercise;
      return chai.request(app)
        .get('/workouts')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          console.log(res.body)
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
  });
});

  //   it('should return a single exercise when using id', function() {
  //     let exercise;
  //     return Exercise
  //       .findOne()
  //       .then(_exercise => {
  //         exercise = _exercise;
  //
  //         return chai.request(app)
  //           .get(`/exercises/${exercise.id}`)
  //           .then(res => {
  //             expect(res).to.have.status(200);
  //             expect(res).to.be.a.json;
  //             expect(res.body).to.be.a('object');
  //             expect(res.body.id).to.equal(exercise.id);
  //             expect(res.body.name).to.equal(exercise.name);
  //             expect(res.body.description).to.equal(exercise.description);
  //           })
  //       })
  //
  //   })
  //
  // });
  //
  // describe('POST endpoint', function() {
  //
  //   it('should add a new exercise', function() {
  //     const newExercise = {
  //       name: 'New Exercise',
  //       description: 'Description for a new exercise',
  //       muscleGroup: {
  //         main: 'main muscle',
  //         secondary: ['secondary muscle', 'secondary muscle-1']
  //       },
  //       equipment: ['equipment-1', 'equipment-1']
  //     };
  //
  //     return chai.request(app)
  //       .post('/exercises')
  //       .send(newExercise)
  //       .then(function(res) {
  //         expect(res).to.have.status(201);
  //         expect(res).to.be.a.json;
  //         expect(res.body).to.be.a('object');
  //         const expectedKeys = ['id', 'name', 'description', 'muscleGroup', 'equipment'];
  //         expect(res.body).to.include.keys(expectedKeys);
  //         expect(res.body.id).to.not.be.null;
  //         expect(res.body.name).to.equal(newExercise.name);
  //         expect(res.body.description).to.equal(newExercise.description);
  //         expect(res.body.muscleGroup.main).to.equal(newExercise.muscleGroup.main);
  //         expect(res.body.muscleGroup.secondary).to.deep.equal(newExercise.muscleGroup.secondary);
  //         expect(res.body.equipment).to.deep.equal(newExercise.equipment);
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
