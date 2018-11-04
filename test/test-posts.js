'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Post = require('../posts/models');
const User = require('../users/models');
const {TEST_BUILDER_DATABASE} = require('../config');
const {JWT_SECRET} = require('../config');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
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
    return runServer(TEST_BUILDER_DATABASE);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    console.log(JWT_SECRET)
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

  describe('GET endpoint /api/posts', function() {

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
              expect(res.body._id).to.include(postId);
              const expectedKeys = ['_id', 'title', 'content', 'likes', 'creator', 'created'];
              expect(res.body).to.have.all.keys(expectedKeys)
            });
        })
    });
  });

  describe("POST /api/posts", function () {

    it("should create and return a new post", function () {
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
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");

          const expectedPostKeys = ['_id', 'title', 'content', 'created', 'creator', 'likes'];
          expect(res.body).to.include.keys(expectedPostKeys)
        });
      });
  });

  describe("PUT /api/posts/:id", function () {

    it("should update the post", function () {
      const updateItem = {
        "title": "What workout?!",
        "content": "what a great workout"
      };
      let data;

      return Post
        .findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .put(`/api/posts/${data._id}`)
            .send(updateItem)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.all.keys("_id", "title", "content", "likes", "creator", "created");
          expect(res.body._id).to.equal(data.id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
        });
      });
  });

  describe("DELETE  /api/posts/:id", function () {

    it("should delete an workout by id", function () {
      let data;

      return Post
        .findOne({ creator: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/posts/${data._id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
        })
    });
  });
});
