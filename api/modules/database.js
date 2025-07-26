const knex = require('knex');
const path = require('path');
const knexfile = require(path.resolve(__dirname, '../knexfile.js'));

const env = process.env.NODE_ENV || 'development';
const db = knex(knexfile[env]);

module.exports = db;