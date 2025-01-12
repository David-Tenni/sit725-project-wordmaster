const jwt = require('jsonwebtoken');

const protect= (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "No token found" });

    jwt.verify(token, "temporary_secret_key", (error, result) => {
        if (error){
            //console.log(error);
            return res.status(401).json({ message: "Invalid token" });}
        req.user = result;
        next();
    });
};

const check = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token){
        jwt.verify(token, "temporary_secret_key", (error, result) => {
            if (!error){
                req.user = result;}

        });
    }            
    next();
};

module.exports = {protect, check};