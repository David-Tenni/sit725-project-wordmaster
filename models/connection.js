const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.URI;

const client = new MongoClient(uri);
 
client.connect();

module.exports = client;