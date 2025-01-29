const jwt = require('jsonwebtoken');

//prevents unauthenticated users from accessing
const protect= (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "No token found" });

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, result) => {
        if (error){
            //console.log(error);
            return res.status(401).json({ message: "Invalid token" });}
        req.user = result;
        next();
    });
};

//checks if users are authenticated but allows access either way
const check = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token){
        jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, result) => {
            if (!error){
                req.user = result;}

        });
    }            
    next();
};

module.exports = {protect, check};