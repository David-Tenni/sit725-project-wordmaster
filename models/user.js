let client = require('./connection');

let collection = client.db('authentication').collection("users");

async function getUser(username, callback) {
    try{
        const user = await collection.findOne({ username: username });
        callback(null, user);
    }catch(error){
        callback({message: "Error finding user"}, user);
    }
}

async function postUser(user, callback) {
    try{
        const existingUser = await collection.findOne({ username: user.username });
        if (existingUser) return callback({ message: "User already exists" }, null);
        user.created = new Date();
        const result = await collection.insertOne(user);
        callback(null, result);
    }catch(error){
        callback({message: "Error inserting user"}, user);
    }
}

async function addRefreshToken(username, token) {
    try{
        const user = await collection.findOne({ username: username });
        await collection.updateOne(
            { username },
            { $set: { 'token': token } }
        );
    }catch(error){
        callback({message: "Error refreshing token"}, user);
    }
}

async function findRefreshToken(token, callback) {
    try{
        const user = await collection.findOne({ token: token });

        if (user) {
            callback(null, user);
        }else{
            callback({ message: "User not found" }, null);
        }
    }catch(error){
        callback({message: "Error finding refresh token"}, user);
    }

}

async function updateUserAnswer(username, category, answer, callback){
    try{
        const user = await collection.findOne({ username: username });
        if (!user) return callback({ message: "User does not exist" });

        if (!user.answers) {
            await collection.updateOne(
                { username: username },
                { $set: { answers: { [category]: answer } } }
            );
        } else {
            user.answers[category] = answer;

            await collection.updateOne(
                { username },
                { $set: { answers: user.answers } }
            );
        }
        callback(null);
    }catch(error){
        callback({message: "Error updating user"});
    }     
}

async function updateUserPassword(username, password, callback){
    try{
        const user = await collection.findOne({ username: username });
        if (!user) return callback({ message: "User does not exist" }, null);
    
        await collection.updateOne(
            { username: username },
            { $set: { password: password } }
        );

        callback(null);
    }catch(error){
        callback({message: "Error updating user"});
    }     
}

async function deleteUser(username, callback){
    try{
        await collection.deleteOne({username: username});
        callback(null);
    }catch(error){
        callback({message: "Error deleting user"});
    }
    
}

module.exports = {getUser,postUser,updateUserAnswer,updateUserPassword,deleteUser,addRefreshToken,findRefreshToken}