const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Post} = require('./models');
const {User} = require('../users/models');

router.get('/', (req, res) => {
  console.log('making get request....')
  Post
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/username/:username', (req, res) => {
  User
    .find({"username": `${req.params.username}`})
    .then(userPosts => {
      res.json(userPosts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.get('/:id', (req, res) => {
  console.log('checking if current user is following another user...')
  Post
    .findById(req.params.id)
    .then(posts => {
      res.json(posts.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong.'})
    });
});

router.post('/', (req,res) => {
  const requiredFields = ['title', 'content'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  console.log(req.user.id)

  let postId;
  console.log('scanning through posts collection...')
  return Post
    .create({
      creator: req.user.id,
      title: req.body.title,
      content: req.body.content
    })
    .then(post => {
      console.log('successfully created a post...')
      postId = post._id;

      return User
        .findById(req.user.id)
        .then(userPost => {
          console.log('found user and now retrieving its object...')
          userPost.posts.push(postId);
          return userPost.save().then(u => res.status(201).json(post.serialize()));
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

router.delete('/:id', (req, res) => {
  Post
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Sucessfully deleted'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went horribly wrong'})
    })
})

router.put('/:id', (req, res) => {
  // if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  //   res.status(400).json({
  //     error: 'Request path id and request body id values must match'
  //   });
  // }

  const updated = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Post
    .findByIdAndUpdate(req.params.id, {$set: updated}, { new: true})
    .then(updatedWorkout => res.status(204).json(updatedWorkout.serialize()))
    .catch(err => res.status(500).json({message: `Something went horribly wrong`}));
});

module.exports = {router};
