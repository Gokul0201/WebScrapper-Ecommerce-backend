const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
require('dotenv').config();
const dbName= process.env.DB_NAME
const dbUrl = `${process.env.DB_URL}/${process.env.DB_NAME}`
module.exports = {dbName,dbUrl,mongodb,MongoClient}