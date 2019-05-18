const fs = require('fs');
const path = require('path');

const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('./../config/config.js')[env];

const db = {};

let sequelize;
if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

fs.readdirSync(__dirname) // read all files in the current directory
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && // ignore hidden files
      file !== basename && // don't include this file(index.js)
      file.slice(-3) === '.js', // file must have js extension
  )
  .forEach((file) => {
    // import the model from its individual file.
    const model = sequelize.import(path.join(__dirname, file));
    // add each model to the db object.
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // add the connection to the exported object.
db.Sequelize = Sequelize;

module.exports = db;
