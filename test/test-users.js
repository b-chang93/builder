// 'use strict';
//
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');
//
// const { app, runServer, closeServer } = require('../server');
// const { User } = require('../users');
// const { TEST_BUILDR_DATABASE } = require('../config');
// const userData = require('../seed-data/users-seed-data.json');
//
// const expect = chai.expect;
// chai.use(chaiHttp);
//
//
// function seedUserData() {
//   console.log('Seeding exercises into db...');
//
//   return User.insertMany(userData);
// };
//
// function tearDownDb() {
//   console.log('Deleting database...');
//   return mongoose.connection.dropDatabase();
// };
//
//
// describe('/api/user', function () {
//   const username = 'exampleUser';
//   const password = 'examplePass';
//   const firstName = 'Example';
//   const lastName = 'User';
//   const usernameB = 'exampleUserB';
//   const passwordB = 'examplePassB';
//   const firstNameB = 'ExampleB';
//   const lastNameB = 'UserB';
//   const avatar = '';
//   const followers = [];
//   const following = [];
//   // let id = '';
//   const posts = [];
//
//
//   before(function () {
//     return runServer(TEST_BUILDR_DATABASE);
//   });
//
//   after(function () {
//     return closeServer();
//   });
//
//   beforeEach(function() {
//     return seedUserData();
//   })
//
//   afterEach(function () {
//     // return User.remove({});
//     return tearDownDb();
//   });
//
//   describe('/api/users/signup', function () {
//     describe('POST', function () {
//       it('Should reject users with missing username', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             password,
//             firstName,
//             lastName
//           })
//           .then( res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal('Missing field');
//             expect(res.body.location).to.equal('username');
//           });
//       });
//       it('Should reject users with missing password', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal('Missing field');
//             expect(res.body.location).to.equal('password');
//           });
//       });
//       it('Should reject users with non-string username', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username: 1234,
//             password,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Incorrect field type: expected string'
//             );
//             expect(res.body.location).to.equal('username');
//           });
//       });
//       it('Should reject users with non-string password', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password: 1234,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Incorrect field type: expected string'
//             );
//             expect(res.body.location).to.equal('password');
//           });
//       });
//       it('Should reject users with non-string first name', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password,
//             firstName: 1234,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Incorrect field type: expected string'
//             );
//             expect(res.body.location).to.equal('firstName');
//           });
//       });
//       it('Should reject users with non-string last name', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password,
//             firstName,
//             lastName: 1234
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Incorrect field type: expected string'
//             );
//             expect(res.body.location).to.equal('lastName');
//           });
//       });
//       it('Should reject users with non-trimmed username', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username: ` ${username} `,
//             password,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Cannot start or end with whitespace'
//             );
//             expect(res.body.location).to.equal('username');
//           });
//       });
//       it('Should reject users with non-trimmed password', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password: ` ${password} `,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Cannot start or end with whitespace'
//             );
//             expect(res.body.location).to.equal('password');
//           });
//       });
//       it('Should reject users with empty username', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username: '',
//             password,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Must be at least 1 characters long'
//             );
//             expect(res.body.location).to.equal('username');
//           });
//       });
//       it('Should reject users with password less than ten characters', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password: '123456789',
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Must be at least 10 characters long'
//             );
//             expect(res.body.location).to.equal('password');
//           });
//       });
//       it('Should reject users with password greater than 72 characters', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password: new Array(73).fill('a').join(''),
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Must be at most 72 characters long'
//             );
//             expect(res.body.location).to.equal('password');
//           });
//       });
//       it('Should reject users with duplicate username', function () {
//         // Create an initial user
//         return User.create({
//           username,
//           password,
//           firstName,
//           lastName
//         })
//           .then(() =>
//             // Try to create a second user with the same username
//             chai.request(app).post('/api/users/signup').send({
//               username,
//               password,
//               firstName,
//               lastName
//             })
//           )
//           .then(res => {
//             expect(res).to.have.status(422);
//             expect(res.body.reason).to.equal('ValidationError');
//             expect(res.body.message).to.equal(
//               'Username already taken'
//             );
//             expect(res.body.location).to.equal('username');
//           });
//       });
//       it('Should create a new user', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password,
//             firstName,
//             lastName
//           })
//           .then(res => {
//             expect(res).to.have.status(201);
//             expect(res.body).to.be.an('object');
//             expect(res.body).to.have.keys(
//               'username',
//               'firstName',
//               'lastName',
//               'avatar',
//               'followers',
//               'following',
//               'posts',
//               'id'
//             );
//             expect(res.body.username).to.equal(username);
//             expect(res.body.firstName).to.equal(firstName);
//             expect(res.body.lastName).to.equal(lastName);
//             return User.findOne({
//               username
//             });
//           })
//           .then(user => {
//             expect(user).to.not.be.null;
//             expect(user.firstName).to.equal(firstName);
//             expect(user.lastName).to.equal(lastName);
//             return user.validatePassword(password);
//           })
//           .then(passwordIsCorrect => {
//             expect(passwordIsCorrect).to.be.true;
//           });
//       });
//       it('Should trim firstName and lastName', function () {
//         return chai
//           .request(app)
//           .post('/api/users/signup')
//           .send({
//             username,
//             password,
//             firstName: ` ${firstName} `,
//             lastName: ` ${lastName} `
//           })
//           .then(res => {
//             expect(res).to.have.status(201);
//             expect(res.body).to.be.an('object');
//             expect(res.body).to.have.keys(
//               'username',
//               'firstName',
//               'lastName',
//               'avatar',
//               'followers',
//               'following',
//               'posts',
//               'id'
//             );
//             expect(res.body.username).to.equal(username);
//             expect(res.body.firstName).to.equal(firstName);
//             expect(res.body.lastName).to.equal(lastName);
//             return User.findOne({
//               username
//             });
//           })
//           .then(user => {
//             expect(user).to.not.be.null;
//             expect(user.firstName).to.equal(firstName);
//             expect(user.lastName).to.equal(lastName);
//           });
//       });
//     });
//
//     describe('GET', function () {
//       it('Should return an empty array initially', function () {
//         return chai.request(app).get('/api/users').then(res => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.be.an('array');
//           expect(res.body).to.have.length(0);
//         });
//       });
//
//       it('Should return a single user when using id', function () {
//         return chai.request(app).get('/api/users').then(res => {
//           console.log(res.body)
//           expect(res).to.have.status(200);
//           expect(res.body).to.be.an('array');
//           expect(res.body).to.have.length(0);
//         });
//       });
//     });
//   });
// });
