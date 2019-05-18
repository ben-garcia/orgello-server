const express = require('express');
const Joi = require('joi');

const router = express.Router();

const Card = require('../db/models').card;

const {
  validateParam,
  isTokenPresent,
  verifyToken,
} = require('../middlewares/users');
const {
  validateCardHasCorrectBodyContents,
  checkCardOwnerIdMatchesUserId,
} = require('../middlewares/cards');

// every new card MUST meet these requirements.
const schema = Joi.object().keys({
  title: Joi.string()
    .trim()
    .required(),
  order: Joi.number()
    .integer()
    .required(),
  archived: Joi.boolean(),
  listId: Joi.number()
    .integer()
    .required(),
});

// create a new card that MUST match the schema
router.post(
  '/',
  validateParam,
  isTokenPresent,
  verifyToken,
  (req, res, next) => {
    const result = Joi.validate(req.body, schema);

    // if req.body is not valid.
    if (result.error !== null) {
      res.status(422);
      next({ message: result.error.message });
    } else {
      // new Card
      const newCard = {
        ...req.body,
      };
      // insert list into the database.
      Card.create(newCard)
        // send to newly created list to the client.
        .then((card) => {
          res.status(201); // created
          res.json(card);
        })
        // if the list failed to be created.
        .catch((e) => next({ message: e.message }));
    }
  },
);

// update the card with properties in req.body
router.put(
  '/:cardId',
  validateParam,
  isTokenPresent,
  verifyToken,
  validateCardHasCorrectBodyContents,
  checkCardOwnerIdMatchesUserId,
  (req, res, next) => {
    Card.update(
      { ...req.body },
      {
        where: {
          id: req.params.cardId,
        },
      },
    )
      .then(() => {
        res.json({ id: Number(req.params.cardId), ...req.body });
      })
      .catch((e) => next({ message: e.message }));
  },
);

module.exports = router;
