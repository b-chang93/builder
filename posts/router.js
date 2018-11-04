const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const User = require('../users/models');
const Post = require('./models');

router.get('/', (req, res) => {
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

  let postId;
  return Post
    .create({
      creator: req.user._id,
      title: req.body.title,
      content: req.body.content,
      workout: req.body.workout
    })
    .then(post => {
      postId = post._id;

      return User
        .findById(req.user._id)
        .then(userPost => {
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
    .findById(req.params.id)
    .then(post => {
      if(post.creator._id == req.user._id) {
        Post
          .findByIdAndRemove(req.params._id)
          .then(() => {
            res.status(204).json({message: 'Sucessfully deleted'});
          })
          .then(() => {
            return User
              .findById(req.user._id)
              .then(userPost => {
                let index = userPost.posts.indexOf(req.params.id);
                if (index > -1) {
                  userPost.posts.splice(index, 1);
                }
                return userPost.save()
              })
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went horribly wrong'})
          })
      } else {
          res.status(403).json({
             error: "You do not have authorization to delete another user's post"
           });
      }
    })
})

router.put('/:id', (req, res) => {
  const updated = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Post
    .findByIdAndUpdate(req.params.id, {$set: updated}, { new: true})
    .then(updatedWorkout => res.status(200).json(updatedWorkout.serialize()))
    .catch(err => res.status(500).json({message: `Something went horribly wrong`}));
});

module.exports = router;
