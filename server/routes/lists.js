const express = require('express');
const Joi = require('joi');

const router = express.Router();

const List = require('../db/models').list;

const {
  validateParam,
  isTokenPresent,
  verifyToken,
} = require('../middlewares/users');
const {
  validateListHasCorrectBodyContents,
  checkListOwnerIdMatchesUserId,
} = require('../middlewares/lists');

// every new list MUST meet these requirements.
const schema = Joi.object().keys({
  title: Joi.string()
    .trim()
    .required(),
  order: Joi.number()
    .integer()
    .required(),
  archived: Joi.boolean(),
  boardId: Joi.number()
    .integer()
    .required(),
});

// create a list and add it to the db
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
      // new List
      const newList = {
        ...req.body,
      };
      // insert list into the database.
      List.create(newList)
        // send to newly created list to the client.
        .then((list) => {
          res.status(201); // created
          res.json(list);
        })
        // if the list failed to be created.
        .catch((e) => next({ message: e.message }));
    }
  },
);

// update the list with the given id using property/properties
// in req.body
router.put(
  '/:listId',
  validateParam,
  isTokenPresent,
  verifyToken,
  validateListHasCorrectBodyContents,
  checkListOwnerIdMatchesUserId,
  (req, res, next) => {
    List.update(req.body, {
      where: {
        id: req.params.listId,
      },
    })
      .then(() => {
        res.json({ id: Number(req.params.listId), ...req.body });
        // res.json({ message: 'list updated', updatedList });
      })
      .catch((e) => next({ message: e.message }));
  },
);

module.exports = router;
