const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/user');

const postUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ statusCode: 400, message: "Username or password is missing" });

    const hash = await bcrypt.hash(password, 10);
    const userToAdd = { username, password: hash };
    db.postUser(userToAdd, (error, result) => {
        if (!error) {
            res.status(201).json({ statusCode:201,data:result,message:'New user registered'});
        }
        else if (error.message == "User already exists"){
            res.status(409).json({ statusCode:409, message:'User already exists'});
        }
    });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ statusCode: 400, message: "Username or password is missing" });

    db.getUser(username, async (error, user) => {
        if (!user) return res.status(401).json({ statusCode: 401, message: "Password or Username are incorrect" });

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) return res.status(401).json({ statusCode: 401, message: "Password or Username are incorrect" });

        const accessToken = jwt.sign({ username: user.username }, "temporary_secret_key", { expiresIn: "1h" });
        const refreshToken = jwt.sign({ username: user.username }, "temporary_refresh_secret", { expiresIn: "1d" });

        db.addRefreshToken(username, refreshToken)

        res.status(200).json({ statusCode: 200, message: "Successfully logged in", accessToken: accessToken, refreshToken: refreshToken });
    });
};

const refresh = async (req, res) => {
    const token = req.body.token;
    if (!token) return res.status(401).json({ message: "Invalid token" });

    db.findRefreshToken(token, async (error, user) => {
        if(!error){
            jwt.verify(token, "temporary_refresh_secret", (err, result) => {
                if (err) return res.status(401).json({ statusCode: 401, message: "Invalid token" });
                const accessToken = jwt.sign({ username: result.username }, "temporary_secret_key", { expiresIn: "1h" });
                res.json({ message: "Token successfully refreshed", accessToken: accessToken });
            });
        }else if(error.message == "User not found"){
            return res.status(401).json({ message: "Invalid token" });
        }
    });
};

const getUser = async (req, res) => {
    let username = req.user.username;

    db.getUser(username, (error, result) => {
        if(!result) return res.status(404).json({ statusCode: 404, message: "User not found" });
        if (!error){
            delete result.password; // The password retrieved from the database will be a hash so it will be useless to show it
            res.status(200).json({statusCode:200,data:result,message:'success'});
        }
    });
};

async function updateUserWord(req, res) {
    let username = req.user.username;

    var category = Object.keys(req.body)[0];
    var word = req.body[category];

    db.updateUserWord(username, category, word, (error) => {
        if (!error){
            res.status(201).json({statusCode:201,message:'Word updated'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({statusCode:404,message:"User does not exist"});
        }
    })
}

async function updateUserPassword(req, res) {
    let username = req.user.username;
    let password = req.body.password;
    const hash = await bcrypt.hash(password, 10);
    db.updateUserPassword(username, hash, (error) => {
        if (!error){
            res.status(201).json({statusCode:201,message:'Password updated'});
        }
        else if(error.message == "User does not exist"){
            res.status(404).json({statusCode:404,message:"User does not exist"});
        }
    })
}

async function deleteUser(req, res) {
    let username = req.user.username;

    db.deleteUser(username, (error) => {
        if (!error){
            res.status(204).json({statusCode:204,message:'User deleted'});
        }
    })
}

module.exports = {postUser, login, refresh, getUser, updateUserWord, updateUserPassword, deleteUser}