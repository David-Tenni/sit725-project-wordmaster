const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://dbuser:GutqNP8iGf5D8ZPQ@wordmastercluster.fspcr.mongodb.net/?retryWrites=true&w=majority&appName=WordMasterCluster";

const client = new MongoClient(uri);
 
client.connect();

module.exports = client;