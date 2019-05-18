const Joi = require('joi');

const User = require('../db/models').user;
const Board = require('../db/models').board;
const List = require('../db/models').list;

// req.body can ONLY contain an object that matches
// the folowing schema
const schema = Joi.object().keys({
  title: Joi.string().trim(),
  order: Joi.number().integer(),
  archived: Joi.boolean(),
  boardId: Joi.number().integer(),
});

// when sending a request to update a list
// the body of the request can ONLY contain an object
// that matches the schema defined above.
function validateListHasCorrectBodyContents(req, res, next) {
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
// of the board it belongs to
// otherwise the user is unauthorized
function checkListOwnerIdMatchesUserId(req, res, next) {
  List.findOne({
    where: {
      id: req.params.listId,
    },
    // query will return the owner of the list and
    // the owner of the board the list belongs to
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
  })
    .then((list) => {
      // make sure the query returns at least one board
      if (list) {
        // check that the user id matches the list board owner
        if (req.user.id === list.board.owner.id) {
          // if matches so continue to the next middleware in the stack.
          next();
        } else {
          // otherwise error passed to the error handler
          next({ message: 'you are not authorized to update this list' });
        }
      } else {
        // otherwise send a message
        next({ message: 'no list found that matches that listId' });
      }
    })
    .catch((e) => next({ message: e.message }));
}

module.exports = {
  validateListHasCorrectBodyContents,
  checkListOwnerIdMatchesUserId,
};
