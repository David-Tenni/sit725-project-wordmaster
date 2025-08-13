const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/user');
const categories = require('../models/word')

//sign up
const postUser = async (req, res) => {
    //get data and validate them
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({message: "Username or password is missing"});

    //create arguments for database call
    const hash = await bcrypt.hash(password, 10);
    const userToAdd = { username, password: hash };

    //make database call and respond
    db.postUser(userToAdd, (error, result) => {
        if (!error) {
            res.status(201).json({data:result,message:'New user registered'});
        }
        else if (error.message == "User already exists"){
            res.status(409).json({message:'User already exists'});
        }
        else{
            res.status(500).json({message:error.message})
        }
    });
};

//receive an access and refresh token
const login = async (req, res) => {
    //get data and validate
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({message: "Username or password is missing" });

    db.getUser(username, async (error, user) => {
        //check if username is real
        if(error == "Error finding user") return res.status(500).json({message:error.message});
        if (!user) return res.status(401).json({message: "Password or Username are incorrect" });
        
        //check if password is correct
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) return res.status(401).json({message: "Password or Username are incorrect" });

        //create tokens
        const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ username: user.username }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "1d" });

        //add the refresh token to the user
        db.addRefreshToken(username, refreshToken)

        res.status(200).json({message: "Successfully logged in", accessToken: accessToken, refreshToken: refreshToken });
    });
};

//get user by their username
async function getUserByUsername(req, res) {
    //get data
    const username = req.params.username;
    if (!username) {
        return res.status(400).json({message: "Username is required"});
    }

    //make database call and respond
    db.getUser(username, (error, result) => {
        if(!result) {
            return res.status(404).json({message: "User not found"});
        }
        if (!error) {
            delete result.password; 
            delete result.token;
            res.status(200).json({data: result, message: 'User successfully retrieved'});
        } else {
            res.status(500).json({message: error.message});
        }
    });
}

//get a new access token using the refresh token
const refresh = async (req, res) => {
    //get token
    const token = req.body.token;
    if (!token) return res.status(401).json({ message: "Invalid token" });

    //make database call and respond
    db.findRefreshToken(token, async (error, user) => {
        if(!error){
            //check if refresh token is valid and respond appropriatly
            jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err, result) => {
                if (err) return res.status(401).json({ message: "Invalid token" });
                const accessToken = jwt.sign({ username: result.username }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "1h" });
                res.status(200).json({ message: "Token successfully refreshed", accessToken: accessToken });
            });
        }else if(error.message == "User not found"){
            return res.status(401).json({message: "Invalid token"});
        }
        else{
            res.status(500).json({message:error.message})
        }
    });
};

//get the current user
const getUser = async (req, res) => {
    //get the username from the request
    let username = req.user.username;

    //make database call and respond
    db.getUser(username, (error, result) => {
        if(!result) return res.status(404).json({message: "User not found" });
        if (!error){
            delete result.password; // The password retrieved from the database will be a hash so it will be useless to show it
            res.status(200).json({data:result,message:'User successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message})
        }
    });
};

//add an answer to the current user
async function updateUserAnswer(req, res) {
    //get username and data for the answer and validate them
    let username = req.user.username;
    let { category, word, time } = req.body;

    if(!category || !word || !time) return res.status(400).json({message:"Answer must contain category, word and time"});

    let isCategory = await categories.isCategory(category);
    if(!isCategory) return res.status(404).json({message:"Category not found"});

    const answer = { word, time };

    //make database call and respond
    db.updateUserAnswer(username, category, answer, (error) => {
        if (!error){
            res.status(201).json({message:'Word updated'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({message:"User does not exist"});
        }
        else{
            res.status(500).json({message:error.message})
        }
    })
}

//update the user after a game is played
async function postUserGame(req, res) {
    //get username and game data and validate them
    let username = req.user.username;
    let { win, score } = req.body;

    if(win == undefined || win == null || !score) return res.status(400).json({message:"Request must contain win and score"});

    if(isNaN(Number(score))) return res.status(400).json({message:"Score must be a number"});

    if(typeof win !== "boolean") return res.status(400).json({message:"Win must be true or false"});

    //make database call and respond
    db.postUserGame(win, Number(score), username, (error) => {
        if (!error){
            res.status(201).json({message:'Game data added to user'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({message:"User does not exist"});
        }
        else{
            res.status(500).json({message:error.message})
        }
    })
}

//reset the current users password
async function updateUserPassword(req, res) {
    //get username and new password
    let username = req.user.username;
    let password = req.body.password;
    if(!password) return res.status(400).json({message:"Password does not exist"});

    //hash to password
    const hash = await bcrypt.hash(password, 10);

    //make database call and respond
    db.updateUserPassword(username, hash, (error) => {
        if (!error){
            res.status(201).json({message:'Password updated'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({message:"User does not exist"});
        }
        else{
            res.status(500).json({message:error.message})
        }
    })
}

//delete the current user
async function deleteUser(req, res) {
    //get user
    let username = req.user.username;

    //make database call and respond
    db.deleteUser(username, (error) => {
        if (!error){
            res.status(204).json({message:'User deleted'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({message:"User does not exist"});
        }
        else{
            res.status(500).json({message:error.message})
        }
    })
}

module.exports = {postUser, login, refresh, getUser, updateUserAnswer, updateUserPassword, deleteUser, postUserGame, getUserByUsername};