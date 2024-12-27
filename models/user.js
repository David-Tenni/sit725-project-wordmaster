let client = require('./connection');

let collection = client.db('authentication').collection("users");

async function getUser(username, callback) {
    const user = await collection.findOne({ username: username });
    callback(null, user);
}

async function postUser(user, callback) {
    const existingUser = await collection.findOne({ username: user.username });
    if (existingUser) return callback({ message: "User already exists" }, null);
    user.created = new Date();
    const result = await collection.insertOne(user);
    callback(null, result);
}

async function updateUserWord(username, category, word, callback){

    const user = await collection.findOne({ username: username });
    if (!user) return callback({ message: "User does not exist" });

    if (!user.words) {
        await collection.updateOne(
            { username: username },
            { $set: { words: { [category]: word } } }
        );
    } else {
        user.words[category] = word;

        await collection.updateOne(
            { username },
            { $set: { words: user.words } }
        );
    }
    callback(null);
}

async function updateUserPassword(username, password, callback){
    const user = await collection.findOne({ username: username });
    if (!user) return callback({ message: "User does not exist" }, null);
  
    await collection.updateOne(
      { username: username },
      { $set: { password: password } }
    );

    callback(null);
}

async function deleteUser(username, callback){
    await collection.deleteOne({username: username});
    callback(null);
}

module.exports = {getUser,postUser,updateUserWord,updateUserPassword,deleteUser}