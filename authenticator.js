const jwt = require('jsonwebtoken');

const authenticator = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.json({ statusCode: 401, message: "No token found" });

    jwt.verify(token, "temporary_secret_key", (error, result) => {
        if (error){
            console.log(error);
            return res.json({ statusCode: 401, message: "Invalid token" });}
        req.user = result;
        next();
    });
};

module.exports = authenticator;