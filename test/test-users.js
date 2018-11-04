'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const {User} = require('../users');
const { TEST_BUILDER_DATABASE } = require('../config');
const {JWT_SECRET} = require('../config');
const userData = require('../seed-data/users-seed-data.json');

const expect = chai.expect;
chai.use(chaiHttp);


function seedUserData() {
  console.log('Seeding exercises into db...');

  return User.insertMany(userData)
  .then(([users]) => {
    user = users[0]
    token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
  })
};

function tearDownDb() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
};


describe('API resource /api/user', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const firstNameB = 'ExampleB';
  const lastNameB = 'UserB';
  const avatar = '';
  const followers = [];
  const following = [];
  const posts = [];
  let user = {};
  let userTwo = {};
  let token;


  before(function () {
    return runServer(TEST_BUILDER_DATABASE);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(userData)
    ])
    .then(([users])=> {
      user = users[0];
      userTwo = users[1];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
    });
  });

  afterEach(function () {
    return tearDownDb();
  });

  describe('/api/users', function () {
    describe('GET', function () {
      it('Should return all users in db', function () {
        return chai.request(app)
          .get(`/api/users/`)
          .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.at.least(1);
          const expectedUserKeys = ['_id', 'username', 'firstName', 'lastName', 'avatar', 'posts', 'followers', 'following'];
          expect(res.body[0]).to.include.keys(expectedUserKeys)
        });
      });

      it('Should return a single user when using id', function () {
        return chai.request(app)
          .get(`/api/users/${user._id}`)
          .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.a.json;
          expect(res.body).to.be.an('object');
          expect(res.body._id).to.include(user._id);
        });
      });
    });

    describe('DELETE', function () {
      it('Should return all users in db', function () {
        return chai.request(app)
          .delete(`/api/users/${user._id}`)
          .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return User.findById(user._id);
          })
          .then((item) => {
          expect(item).to.be.null;
          });
        });
      });
    });

    describe('PUT /subscribe and /unsubscribe', function () {
      it('PUT - should add a user id to user following field', function () {
          return chai
            .request(app)
            .put(`/api/users/subscribe/${userTwo.username}`)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
              expect(res).to.have.status(201);
              expect(res).to.be.a.json;
              expect(res.body.following[0]).to.include(userTwo._id)

              User.find({username: userTwo.username})
                .then(user => {
                  expect(res.body.followers[0]).to.include(user._id)
                })
            })
      });

      it('should remove the user id following field', function () {

        return chai
          .request(app)
          .put(`/api/users/subscribe/${userTwo.username}`)
          .set("Authorization", `Bearer ${token}`)
          .then(res => {
            return chai
              .request(app)
              .put(`/api/users/unsubscribe/${userTwo.username}`)
              .set("Authorization", `Bearer ${token}`)
              .then(res => {
                expect(res).to.have.status(201);
                expect(res).to.be.a.json;
                expect(res.body.following).to.be.empty;

                User.find({username: userTwo.username})
                  .then(user => {
                    expect(res.body.followers[0]).to.be.empty;
                  })
            })
          })
      });
    });

  describe('/api/users/signup', function () {
    describe('POST', function () {
      it('Should reject users with missing username', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            password,
            firstName,
            lastName
          })
          .then( res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string username', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: 1234,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: 1234,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string first name', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName: 1234,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('firstName');
          });
      });
      it('Should reject users with non-string last name', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName,
            lastName: 1234
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('lastName');
          });
      });
      it('Should reject users with non-trimmed username', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: '',
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password less than ten characters', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: '123456789',
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function () {
        // Create an initial user
        return User.create({
          username,
          password,
          firstName,
          lastName
        })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users/signup').send({
              username,
              password,
              firstName,
              lastName
            })
          )
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Username already taken'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should create a new user', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'avatar',
              'followers',
              'following',
              'posts',
              '_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim firstName and lastName', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName: ` ${firstName} `,
            lastName: ` ${lastName} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'avatar',
              'followers',
              'following',
              'posts',
              '_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });
    });

  });
});
