const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../db/models').user;
const { Op } = require('../db/models').Sequelize;

// Add the beforeCreate hook to hash the password.
User.beforeCreate((user) => {
  console.log('inside beforeCreate hook');
  const newUser = user;
  return bcrypt
    .hash(newUser.password, 10)
    .then((hashedPassword) => {
      newUser.password = hashedPassword;
    })
    .catch((e) => console.log('bcrypt error: ', e));
});

// every new user MUST meet these requirements.
const schema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .email()
    .required(),
  username: Joi.string()
    .trim()
    .alphanum()
    .min(6)
    .max(30)
    .required(),
  password: Joi.string()
    .trim()
    .regex(/^[a-zA-Z0-9]{6,30}$/)
    .required(),
});

const loginSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .email(),
  username: Joi.string()
    .trim()
    .alphanum()
    .min(6)
    .max(30),
  password: Joi.string()
    .trim()
    .regex(/^[a-zA-Z0-9]{6,30}$/)
    .required(),
});

// validate that the user sent by the request if it
// exists in the database
router.post('/signup', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  const { email, username, password } = req.body;

  // if req.body is not valid.
  if (result.error !== null) {
    res.status(422);
    next({ message: result.error.message });
  } else {
    User.findOrCreate({
      where: {
        [Op.or]: [{ email }, { username }],
      },
      // if the user if not found in the db
      // then use the user object passed by req.body
      // to create the user
      defaults: { email, username, password },
    })
      .then(([user, created]) => {
        if (created) {
          // user was not found in the db
          // so a new user was created and added.

          res.status(201);
          res.json({ message: 'User Created' });
        } else {
          // the user was found in the database
          // notify the client and respond with the user(email, username) found

          // determine is email, username or both are taken
          let errorMessage = '';

          // if email is taken
          if (email === user.email) {
            errorMessage += `There already exists a user with that email(${email})`;
          }

          // if username is taken
          if (username === user.username) {
            errorMessage += `\nThere alrleady exists a user with username(${username})`;
          }

          res.status(409); // Conflict email|username taken
          res.json({
            error: {
              message: errorMessage,
            },
          });
        }
      })
      .catch((e) => {
        res.status(409); // Conflict unique contraint
        // add the reason for the error along with a custom header
        if (e.parent) {
          res.set('X-Status-Reason', e.parent.detail);
          next({ message: e.parent.detail });
        }
        next({ message: e });
      });
  }
});

// create a new user in the database if
// after validation is successfull.
router.post('/login', (req, res, next) => {
  // if the user is trying to log in with email, give the username a default value
  // if the user is trying to log in with a username, give the email a defaut value
  const { email = 'no', username = 'no', password } = req.body;
  const result = Joi.validate(req.body, loginSchema);

  // if req.body is not valid.
  if (result.error !== null) {
    res.status(422);
    next({ message: result.error.message });
  } else {
    // query the database for the user.
    User.findOne({
      where: {
        // query the with the email or username
        [Op.or]: [{ email }, { username }],
      },
    })
      .then((user) => {
        // user was found
        if (user) {
          // compare the password passed in to the hashed password in the db
          bcrypt
            .compare(password, user.password)
            .then((passwordsMatch) => {
              if (passwordsMatch) {
                // if there was no error
                // create a new user and do not include the password field
                const newUser = {
                  id: user.id,
                  email: user.email,
                  username: user.username,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                };

                // create a token for the user
                jwt.sign(newUser, process.env.JWT_SECRET, (e, token) => {
                  if (e) {
                    console.log('signing jwt failed');
                    next(new Error('failed to sign token'));
                  }
                  res.status(200);
                  res.json({ ...newUser, token });
                });
              } else {
                res.status(404);
                next(new Error('Credentials Dont Match'));
              }
            })
            .catch((e) =>
              console.log('error when comparing passwords----- ', e.message),
            );
        } else {
          // user not found
          res.status(404);
          next(new Error('Invalid Credentials'));
        }
      })
      // user not found
      .catch((e) => {
        console.log('error-------', e);
        next(new Error(e.message));
      });
  }
});

module.exports = router;
