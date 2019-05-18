const express = require('express');
const cors = require('cors');
const volleyball = require('volleyball');

const db = require('../db/models/');
const boardsRouter = require('../routes/boards');
const listsRouter = require('../routes/lists');
const cardsRouter = require('../routes/cards');
const authRouter = require('../routes/auth');
const photosReducer = require('../routes/unsplash');

const app = express();

app.use(volleyball);
app.use(cors());
app.use(express.json()); // parses 'application/json'

app.use('/auth', authRouter);
app.use('/boards', boardsRouter);
app.use('/lists', listsRouter);
app.use('/cards', cardsRouter);
app.use('/photos', photosReducer);

// 404 Not Found
// eslint-disable-next-line
app.use((req, res, next) => {
  res.status(404);
  res.json({ message: '404 Not Found' });
});

// error handler
// eslint-disable-next-line
app.use((err, req, res, next) => {
  res.json({ error: err.message });
});

db.sequelize
  .authenticate()
  .then(() => console.log('Connection has been established'))
  .catch((e) => console.error('Unable to connect to the database', e));

module.exports = app;
