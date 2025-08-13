let { client } = require('./connection');
let collection = client.db('authentication').collection("users");

//get a user
async function getUser(username, callback) {
    try{
        //making username case insensitive
        const user = await collection.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        callback(null, user);
    }catch(error){
        callback({message: "Error finding user"}, user);
    }
}

//create a user
async function postUser(user, callback) {
    try{
        //check if the username is already in use
        const existingUser = await collection.findOne({ username: user.username });
        if (existingUser) return callback({ message: "User already exists" }, null);

        //create a new user if not
        user.created = new Date();
        const result = await collection.insertOne(user);
        callback(null, result);
    }catch(error){
        callback({message: "Error inserting user"}, user);
    }
}

//add a refresh token to the user
async function addRefreshToken(username, token) {
    try{
        const user = await collection.findOne({ username: username });
        if(!user) throw new Error("User dose not exist");
        return await collection.updateOne(
            { username },
            { $set: { 'token': token } }
        );
    }catch(error){
         return {message: "Error refreshing token"};
    }
}

//check if refresh token exists for any user
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

//update user when answer is given
async function updateUserAnswer(username, category, answer, callback){
    try{
        //check if user exists
        const user = await collection.findOne({ username: username });
        if (!user) return callback({ message: "User does not exist" });

        //check if this word is long enough to replace the current longest word
        if(!user.longest_word || answer.word.replace(/[\s\W_]+/g, '').length >= user.longest_word?.replace(/[\s\W_]+/g, '').length){
            await collection.updateOne(
                { username: username },
                { $set: { longest_word:  answer.word  } }
            );
        }

        //if there is no answers property on the user yet then create one
        if (!user.answers) {
            await collection.updateOne(
                { username: username },
                { $set: { answers: { [category]: answer } } }
            );
        } else {
            //if the word is shorter then the existing word in the that category then do not replace it
            if(user.answers[category]){
                if(user.answers[category].word.replace(/[\s\W_]+/g, '').length > answer.word.replace(/[\s\W_]+/g, '').length) return callback(null);
            }

            // if it is longer then replace it
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

//update user when game has been played
async function postUserGame(win, score, username, callback) {
    try{
        //check if user exists
        const user = await collection.findOne({ username: username });
        if (!user) return callback({ message: "User does not exist" });

        //add the game score to the total score
        await collection.updateOne(
            { username: username },
            { $inc: { total_score: score  } }
        );

        //replace the high score if appropriate
        await collection.updateOne(
            { username: username },
            { $max: { high_score: score } }
        );

        //increase the number of games played by 1
        await collection.updateOne(
            { username: username },
            { $inc: { games: 1 } }
        );

        //if the game was a win then increase the number of wins by 1 as well
        if(win){
            await collection.updateOne(
                { username: username },
                { $inc: { wins: 1 } }
            );
        }
        callback(null);
    }catch(error){
        callback({message: "Error updating user"});
    }     
}

//reset the users password
async function updateUserPassword(username, password, callback){
    try{
        //check if the user exists
        const user = await collection.findOne({ username: username });
        if (!user) return callback({ message: "User does not exist" });
        
        //update the password
        await collection.updateOne(
            { username: username },
            { $set: { password: password } }
        );

        callback(null);
    }catch(error){
        callback({message: "Error updating user"});
    }     
}

//delete the user
async function deleteUser(username, callback){
    try{
        await collection.deleteOne({username: username});
        callback(null);
    }catch(error){
        callback({message: "Error deleting user"});
    }
    
}

module.exports = {getUser,postUser,updateUserAnswer,updateUserPassword,deleteUser,addRefreshToken,findRefreshToken, postUserGame}