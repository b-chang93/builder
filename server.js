'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
let path = require('path');
const {DATABASE_URL, PORT} = require('./config');

const { router: exerciseRouter } = require('./exercises');
const { router: workoutRouter } = require('./workouts');
const { router: postsRouter } = require('./posts');
const { router: usersRouter } = require('./users');
const { router: workoutSplitRouter } = require('./workout-split')
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const jwtAuth = passport.authenticate('jwt', { session: false });
mongoose.Promise = global.Promise;
const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//for redirect into dashboard page
app.get('/dashboard/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/dashboard.html'));
});

//logging using middleware function
app.use(morgan('common'));
app.use(express.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/users/', usersRouter);//check if it is best practice to protect with JWT
app.use('/api/auth/', authRouter);
app.use('/api/posts/', jwtAuth, postsRouter);
// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'You have successfully signed in!'
  })
  .catch(err => {
    console.err(err)
    res.status(401).json({error: 'No token provided'});
  })
});

app.use('/exercises', jwtAuth, exerciseRouter);
app.use('/workouts', workoutRouter);
app.use('/workoutsplit', jwtAuth, workoutSplitRouter);

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}
module.exports = {app, runServer, closeServer};
