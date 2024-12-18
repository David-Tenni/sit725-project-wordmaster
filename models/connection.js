const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://dbuser:ck1A9yAao6wnzar8@wordmastercluster.fspcr.mongodb.net/?retryWrites=true&w=majority&appName=WordMasterCluster";

const client = new MongoClient(uri);
 
client.connect();

module.exports = client;