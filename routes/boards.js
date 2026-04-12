const express = require('express');
const Joi = require('joi');

const router = express.Router();
const Board = require('../db/models').board;
const List = require('../db/models').list;
const Card = require('../db/models').card;

const {
  validateParam,
  isTokenPresent,
  verifyToken,
} = require('../middlewares/users');
const {
  validateBoardHasCorrectBodyContents,
  checkBoardOwnerIdMatchesUserId,
} = require('../middlewares/boards');

// every new board MUST meet these requirements.
const schema = Joi.object().keys({
  title: Joi.string()
    .trim()
    .required(),
  background: Joi.string()
    .trim()
    .required(),
  ownerId: Joi.number()
    .integer()
    .required(),
});

// get all the boards associated with a particular user
router.get(
  '/',
  validateParam,
  isTokenPresent,
  verifyToken,
  (req, res, next) => {
    Board.findAll({
      where: {
        ownerId: req.query.ownerId,
      },
      // order by the most recently updated
      order: [['updatedAt', 'DESC']],
    })
      .then((boards) => {
        res.status(200).json(boards);
      })
      .catch((e) => next({ message: e.message }));
  },
);

// get a single board
router.get(
  '/:boardId',
  validateParam,
  isTokenPresent,
  verifyToken,
  (req, res, next) => {
    Board.findOne({
      where: {
        id: req.params.boardId,
      },
      include: [
        {
          model: List,
          as: 'lists',
          include: [
            {
              model: Card,
              as: 'cards',
            },
          ],
        },
      ],
    })
      .then((board) => {
        res.status(200);
        res.json(board);
      })
      .catch((e) => next({ message: e.message }));
  },
);

// create a new board and validate before adding it to the db.
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
      // new board
      const newBoard = {
        ...req.body,
      };
      // insert board into the database.
      Board.create(newBoard)
        // send to newly created board to the client.
        .then((board) => {
          res.status(201); // created
          res.json(board);
        })
        // if the board failed to be created.
        .catch((e) => next({ message: e.message }));
    }
  },
);

// update the board with the given id using property/properties
// in req.body
router.put(
  '/:boardId',
  validateParam,
  isTokenPresent,
  verifyToken,
  validateBoardHasCorrectBodyContents,
  checkBoardOwnerIdMatchesUserId,
  (req, res, next) => {
    Board.update(req.body, {
      where: {
        id: req.params.boardId,
      },
    })
      .then(() => {
        res.json({ board: req.body });
      })
      .catch((e) => next({ message: e.message }));
  },
);

module.exports = router;
