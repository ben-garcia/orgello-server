require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'ben',
    password: process.env.DB_PASSWORD || 'ben',
    database: process.env.DB_NAME || 'orgello_development',
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  test: {
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
  },
};
