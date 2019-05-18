const Joi = require('joi');

const User = require('../db/models').user;
const Board = require('../db/models').board;

const schema = Joi.object().keys({
  title: Joi.string().trim(),
  background: Joi.string().trim(),
});

function validateBoardHasCorrectBodyContents(req, res, next) {
  const result = Joi.validate(req.body, schema);

  if (result.error !== null) {
    res.status(422);
    next({ message: result.error.message });
  } else {
    next();
  }
}

// query the db to make sure that the user that is requesting the board resource
// is the owner
// if not, they CANNOT update the board
function checkBoardOwnerIdMatchesUserId(req, res, next) {
  Board.findOne({
    where: {
      id: req.params.boardId,
    },
    // include the owner of the board
    include: [
      {
        model: User,
        as: 'owner',
      },
    ],
  })
    .then((board) => {
      // make sure the query returns at least one board
      if (board) {
        // check that the user id matches the board owner
        if (req.user.id === board.owner.id) {
          // if matches so continue to the next middleware in the stack.
          next();
        } else {
          // otherwise error is sent
          next({ message: 'you are not authorized to update this board' });
        }
      } else {
        // otherwise send a message
        next({ message: 'no board found that matches that boardId' });
      }
    })
    .catch((e) => next({ message: e.message }));
}

module.exports = {
  validateBoardHasCorrectBodyContents,
  checkBoardOwnerIdMatchesUserId,
};
