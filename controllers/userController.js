const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/user');

const postUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ statusCode: 400, message: "Username or password is missing" });

    const hash = await bcrypt.hash(password, 10);
    const userToAdd = { username, password: hash };
    db.postUser(userToAdd, (error, result) => {
        if (!error) {
            res.json({ statusCode:201,data:result,message:'New user registered'});
        }
        else if (error.message == "User already exists"){
            res.json({ statusCode:409, message:'User already exists'});
        }
    });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ statusCode: 400, message: "Username or password is missing" });

    db.getUser(username, async (error, user) => {
        if (!user) return res.json({ statusCode: 401, message: "Password or Username are incorrect" });

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) return res.json({ statusCode: 401, message: "Password or Username are incorrect" });

        const token = jwt.sign({ username: user.username }, "temporary_secret_key", { expiresIn: "1h" });
        res.json({ statusCode: 200, message: "Successfully logged in", token: token });
    });
};

const getUser = async (req, res) => {
    let username = req.user.username;

    db.getUser(username, (error, result) => {
        if(!result) return res.json({ statusCode: 404, message: "User not found" });
        if (!error){
            delete result.password; // The password retrieved from the database will be a hash so it will be useless to show it
            res.json({statusCode:200,data:result,message:'success'});
        }
    });
};

async function updateUserWord(req, res) {
    let username = req.user.username;

    var category = Object.keys(req.body)[0];
    var word = req.body[category];

    db.updateUserWord(username, category, word, (error) => {
        if (!error){
            res.json({statusCode:201,message:'success'});
        }
        else if(error.message == "User does not exist"){
            res.json({statusCode:404,message:"User does not exist"});
        }
    })
}

async function updateUserPassword(req, res) {
    let username = req.user.username;
    let password = req.body.password;
    const hash = await bcrypt.hash(password, 10);
    db.updateUserPassword(username, hash, (error) => {
        if (!error){
            res.json({statusCode:201,message:'success'});
        }
        else if(error.message == "User does not exist"){
            res.json({statusCode:404,message:"User does not exist"});
        }
    })
}

async function deleteUser(req, res) {
    let username = req.user.username;

    db.deleteUser(username, (error) => {
        if (!error){
            res.json({statusCode:204,message:'success'});
        }
    })
}

module.exports = {postUser, login, getUser, updateUserWord, updateUserPassword, deleteUser}