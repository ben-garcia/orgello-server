const jwt = require('jsonwebtoken');

// check and make sure that the :userId and :boardId params are numbers
// if not return an error
function validateParam(req, res, next) {
  if (isNaN(req.params.userId || isNaN(req.params.boardId))) {
    next({ message: 'id must be a number' });
  } else {
    next();
  }
}

// check the header of the request for the 'Authorization' header
// that contains the users token.
function isTokenPresent(req, res, next) {
  const authorizationToken = req.get('Authorization');

  if (authorizationToken) {
    // if the request contains the proper credentials
    // add the token to the request object and pass it
    // to the next middleware in the stack.
    const token = authorizationToken.split(' ')[1];
    req.token = token;
    next();
  } else {
    // if no token is found
    next({ message: 'No Authorization header' });
  }
}

// compare the token in the request object with the
// jsonwebtoken used to sign it.
function verifyToken(req, res, next) {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403);
      next({ message: err.message });
    } else {
      req.user = user;
      // check that the :id param matches the user id
      // if not then user is 'unauthorized'
      if (req.user.id === Number(req.params.userId)) {
        next();
      } else if (
        req.params.boardId ||
        // if req.body contains the neccessary object to create a new board
        // then call next to move to the /boards POST endpoint
        (req.body.title && req.body.background && req.body.ownerId) ||
        // if req.params contains ownerId then the client is requesting
        // all boards associated with a particular user
        req.query.ownerId
      ) {
        // if requesting a board resource
        // pass it along the middleware stack
        next();
      } else if (
        req.params.listId ||
        // if req.body contains the necessary properties to create a new list
        // then it checks out
        (req.body.title && req.body.boardId && req.body.order)
      ) {
        // if requesting a list
        // call the next middleware in the stack
        next();
      } else if (
        req.params.cardId ||
        // if req.body contains the neccessary properties to create a new card
        // then move the request along the middleware stack
        (req.body.title && req.body.listId && req.body.order)
      ) {
        // if requesting a card
        next();
      } else {
        res.status(403);
        next({ message: 'Unauthorized' });
      }
    }
  });
}

module.exports = {
  validateParam,
  isTokenPresent,
  verifyToken,
};
