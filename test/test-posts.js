'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Post = require('../posts/models');
const User = require('../users/models');
const {TEST_BUILDR_DATABASE} = require('../config');
const {JWT_SECRET} = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
const faker = require('faker');
const postsData = require('../seed-data/posts-seed-data.json');
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
    return runServer(TEST_BUILDR_DATABASE);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(userData),
      Post.insertMany(postsData),
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

    it('should return all posts in db', function() {

      let resPost;
      return chai.request(app)
        .get('/api/posts')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          const expectedKeys = ['title', 'content', 'likes', 'creator', 'created'];
          res.body.forEach(key => {
            expect(key).to.be.a('object');
            expect(key).to.include.keys(expectedKeys);
          });
        });

        ''
    });

    it('should return a single post when searching by ID in db', function() {
      let postId;

      return Post
        .findOne()
        .then(post => {
          postId = post._id

          return chai.request(app)
            .get(`/api/posts/${postId}`)
            .set('authorization', `Bearer ${token}`)
            .then(res => {

              expect(res).to.have.status(200);
              expect(res).to.be.a.json;
              expect(res.body.id).to.include(postId);
              const expectedKeys = ['id', 'title', 'content', 'likes', 'creator', 'created'];
              expect(res.body).to.have.all.keys(expectedKeys)
            });
        })
    });
  });

  describe("POST /api/posts", function () {

    it("should create and return a new post", function () {
      console.log(`FOUND THE USER ${user._id}`)
      const newPost = {
          "title":"test title",
          "content": "test content",
          "creator": user._id
        }
      let res;
      return chai.request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send(newPost)
        .then(function (_res) {
          res = _res;
          // console.log(`CHECKING POSTS ${res.body}`)
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");

          const expectedPostKeys = ['id', 'title', 'content'];
          expect(res.body).to.include.keys(expectedPostKeys)
        });
      });
    });
  //
  //   it('should return an error when missing "title" field', function () {
  //     const newWorkout = {
  //         "difficulty":"foo",
  //         "exercises":[
  //           {
  //             "name":"foo",
  //             "sets":"foo"
  //           }
  //         ],
  //         "creator": user._id
  //       }
  //     let res;
  //
  //     return chai.request(app)
  //       .post("/workouts")
  //       .set("Authorization", `Bearer ${token}`)
  //       .set('Content-Type', 'applicaton/json')
  //       .send(newWorkout)
  //       .then(function (_res) {
  //         res = _res;
  //         console.log(`ERROR MESSAGE: ${res.body}`)
  //         expect(res).to.have.status(400);
  //         expect(res).to.be.json;
  //         expect(res.body).to.equal("Missing `title` in request body");
  //       });
  //   });
  // });
  //
  // describe("PUT /workouts/:id", function () {
  //
  //   it("should update the workout", function () {
  //     const updateItem = {
  //       "title": "update my workout #2",
  //       "difficulty": "intermediate",
  //       "exercises": [
  //         {
  //           "name":"Test Exercise",
  //           "sets": [
  //               {
  //                   "weight": 185,
  //                   "reps": 8
  //               }
  //             ]
  //         }
  //       ],
  //       "creator": user._id
  //     };
  //     let data;
  //
  //     return Workout.findOne()
  //       .then(_data => {
  //         data = _data;
  //
  //         return chai.request(app)
  //           .put(`/workouts/${data._id}`)
  //           .set("Authorization", `Bearer ${token}`)
  //           .send(updateItem);
  //       })
  //       .then(function (res) {
  //         expect(res).to.have.status(200);
  //         expect(res).to.be.json;
  //         expect(res.body).to.be.a("object");
  //         expect(res.body).to.have.all.keys("id", "title", "difficulty", "exercises", "creator");
  //         expect(res.body.id).to.equal(data.id);
  //         expect(res.body.title).to.equal(updateItem.title);
  //         expect(res.body.difficulty).to.equal(updateItem.difficulty);
  //       });
  //   });
  //
  //   it("should respond with a 400 for an invalid id", function () {
  //     const badId = "NOT-A-VALID-ID";
  //     const updateItem = {
  //       "title": "update my workout #2",
  //       "difficulty": "intermediate",
  //       "exercises": [
  //         {
  //           "name":"Test Exercise",
  //           "sets": [
  //               {
  //                   "weight": 185,
  //                   "reps": 8
  //               }
  //             ]
  //         }
  //       ],
  //       "creator": user._id
  //     };
  //
  //     return chai.request(app)
  //       .put(`/workouts/${badId}`)
  //       .set("Authorization", `Bearer ${token}`)
  //       .send(updateItem)
  //       .then(res => {
  //         console.log(res.body)
  //         expect(res).to.have.status(400);
  //         expect(res.body).to.eq("The 'id' is not valid");
  //       });
  //   });
  //
  //   // it("should respond with a 404 for an non existent id", function () {
  //   //   // "DOESNOTEXIST" is 12 byte string which is a valid Mongo ObjectId()
  //   //   const updateItem = {
  //   //     "title": "update my workout #2",
  //   //     "difficulty": "intermediate",
  //   //     "exercises": [
  //   //       {
  //   //         "name":"Test Exercise",
  //   //         "sets": [
  //   //             {
  //   //                 "weight": 185,
  //   //                 "reps": 8
  //   //             }
  //   //           ]
  //   //       }
  //   //     ],
  //   //     "creator": user._id
  //   //   };
  //   //
  //   //   return chai.request(app)
  //   //     .put("/workouts/DOESNOTEXIST")
  //   //     .set("Authorization", `Bearer ${token}`)
  //   //     .send(updateItem)
  //   //     .then(res => {
  //   //       expect(res).to.have.status(404);
  //   //     });
  //   // });
  //
  //   // it('should return an error when missing "title" field', function () {
  //   //   const updateItem = {
  //   //     "difficulty": "intermediate",
  //   //     "exercises": [
  //   //       {
  //   //         "name":"Test Exercise",
  //   //         "sets": [
  //   //             {
  //   //                 "weight": 185,
  //   //                 "reps": 8
  //   //             }
  //   //           ]
  //   //       }
  //   //     ],
  //   //     "creator": user._id
  //   //   };
  //   //   let data;
  //   //
  //   //   return Workout.findOne()
  //   //     .then(_data => {
  //   //       data = _data;
  //   //
  //   //       return chai.request(app)
  //   //         .put(`/workouts/${data.id}`)
  //   //         .send(updateItem)
  //   //         .set("Authorization", `Bearer ${token}`);
  //   //     })
  //   //     .then(res => {
  //   //       expect(res).to.have.status(400);
  //   //       expect(res).to.be.json;
  //   //       expect(res.body).to.be.a("object");
  //   //       expect(res.body.message).to.equal("Missing `title` in request body");
  //   //     });
  //   // });
  //
  // });
  //
  describe("DELETE  /api/posts/:id", function () {

    it("should delete an workout by id", function () {
      let data;

      return Post
        .findOne()
        .then(_data => {
          data = _data;
          // console.log(data._id)

          return chai.request(app)
            .delete(`/workouts/${data._id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;

          return Post.findById(data._id);
        })
        .then((item) => {
          console.log('CHECKING....')
          console.log(item)
          expect(item).to.be.null;
        });
    });
  });

});
