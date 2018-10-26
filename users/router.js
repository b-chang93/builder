'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const User = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:id', (req, res) => {
  return User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/username/:username', (req, res) => {
  User
    .findOne({"username": `${req.params.username}`})
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    })
})

router.get('/subscribedTo/:id', (req, res) => {
  User
    .findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error"})
    })
});

router.put('/subscribe/:id', jwtAuth, (req, res) => {
  const updatedFollower = {};
  const updateableField = ['followers'];
  updateableField.forEach(field => {
    if (field in req.body) {
      updatedFollower[field] = req.body[field];
    }
  });

  let followerId;

  return User
    .findById(req.params.id)
    .then(targetUser => {
      followerId = req.user.id

      if (!(targetUser.followers.indexOf(followerId) > -1)) {
        targetUser.followers.push(followerId)
        targetUser.save();

        return User
          .findById(req.user.id)
          .then(ownUserId => {
            ownUserId.following.push(targetUser._id);
            return ownUserId.save().then(u => res.status(201).json(u.serialize()));
          })
          .catch(err => {
            console.error(err);
          })
      } else {
        return res.end('You are already following this user.')
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

router.delete('/unsubscribe/:id', jwtAuth, (req, res) => {
  let followerId;

  User
    .findById(req.user.id)
    .then(targetUser => {
      followerId = req.user.id
      let followingIndex = targetUser.following.indexOf(req.params.id);

      if(followingIndex > -1) {
        targetUser.following.splice(followingIndex, 1);
        targetUser.save();
      }

      User
        .findById(req.params.id)
        .then(user => {
          let followerIndex = user.followers.indexOf(req.user.id);

          if (followerIndex > -1) {
            user.followers.splice(followerIndex, 1);
            user.save();
          }
        })

      return User
        .findById(req.user.id)
        .then(user => {
          res.status(201).json(user.serialize());
        })
        .catch(err => {
          console.error(err);
        })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

// Post to register a new user
router.post('/signup', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName'];
  const missingField = requiredFields.find(field => !(field in req.body));
  const defaultAvatar = "https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX5964486.jpg";
  const defaultPost = "5bce680cbb797912f84e8103";

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName,
        avatar: defaultAvatar,
        posts:[defaultPost]
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.delete('/:id', (req, res) => {
  User
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Sucessfully deleted'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
});

module.exports = router;
