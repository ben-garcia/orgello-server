const Joi = require('joi');

const User = require('../db/models').user;
const Board = require('../db/models').board;
const List = require('../db/models').list;
const Card = require('../db/models').card;

// req.body can ONLY contain an object that matches
// the folowing schema
const schema = Joi.object().keys({
  title: Joi.string().trim(),
  order: Joi.number().integer(),
  archived: Joi.boolean(),
  listId: Joi.number().integer(),
});

// when sending a request to update a list
// the body of the request can ONLY contain an object
// that matches the schema defined above.
function validateCardHasCorrectBodyContents(req, res, next) {
  const result = Joi.validate(req.body, schema);

  if (result.error !== null) {
    // if req.body doesn't match schema
    res.status(422); // unprocessable entity
    // send to the error handler
    next({ message: result.error.message });
  } else {
    next();
  }
}

// the users id must match that of the owner
// of the card it belongs to
// otherwise the user is unauthorized
function checkCardOwnerIdMatchesUserId(req, res, next) {
  Card.findOne({
    where: {
      id: req.params.cardId,
    },
    // query will return
    // the list the card belongs to
    // the board the list belongs to
    // and the ownder of the board
    include: [
      {
        model: List,
        as: 'list',
        include: [
          {
            model: Board,
            as: 'board',
            include: [
              {
                model: User,
                as: 'owner',
              },
            ],
          },
        ],
      },
    ],
  })
    .then((card) => {
      // make sure the query returns at least one card
      if (card) {
        // check that the user id matches the card list board owner
        if (req.user.id === card.list.board.owner.id) {
          // if matches so continue to the next middleware in the stack.
          next();
        } else {
          // otherwise error passed to the error handler
          next({ message: 'you are not authorized to update this card' });
        }
      } else {
        // otherwise error
        next({ message: 'no list found that matches that listId' });
      }
    })
    .catch((e) => next({ message: e.message }));
}

module.exports = {
  validateCardHasCorrectBodyContents,
  checkCardOwnerIdMatchesUserId,
};
