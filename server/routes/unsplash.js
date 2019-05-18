const express = require('express');
const Unsplash = require('unsplash-js').default;
const { toJson } = require('unsplash-js');

global.fetch = require('node-fetch');

const router = express.Router();

const unsplash = new Unsplash({
  applicationId: process.env.UNSPLASH_APPLICATION_ID,
  secret: process.env.UNSPLASH_SECRET,
});

function validateQueryParams(req, res, next) {
  // by default query params are strings
  // but the unsplash api accepts numbers for
  // page and per_page arguements.

  const { query } = req.query;

  // make sure query params is not null
  if (!query) {
    res.status(422);
    next(new Error('query param cannot be empty'));
  }

  // make sure the query.query is a string(only containing letters a-zA-Z)
  if (!/^[a-zA-Z]+$/.test(query)) {
    res.status(422);
    next(new Error('query param can only contain letters(a-zA-Z)'));
  }

  // convert arguements to numbers
  const page = Number(req.query.page);
  const perPage = Number(req.query.perPage);

  // make sure that page and perPage are actually numbers;
  if (isNaN(page) || isNaN(perPage)) {
    res.status(422);
    next(new Error(`Both 'page' and 'per_page' query params must be numbers`));
  }

  // if function reaches this point
  // then validation is successfull
  next();
}

// get 6 newly added photos
router.get('/', validateQueryParams, (req, res) => {
  const { page, perPage } = req.query;

  unsplash.photos
    .listPhotos(page, perPage)
    .then(toJson)
    .then((photos) => {
      res.status(200).json(photos);
    })
    .catch((e) => console.log('/photos error: ', e.message));
});

// endpoint that searches the unsplash api for photos matching
// the query parameter
router.get('/search', validateQueryParams, (req, res) => {
  const { query, page, perPage } = req.query;

  unsplash.search
    .photos(query, page, perPage)
    .then(toJson)
    .then((photos) => res.status(200).json(photos.results))
    .catch((e) => console.log('/search error: ', e.message));
});

module.exports = router;
