const { jwt_secret } = require("../keys.js");
const jwt= require("jsonwebtoken");
const generateTokenAndSetCookie =(res,userId)=>{
    const token = jwt.sign({userId}, jwt_secret ,{ expiresIn:"7d"});
    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });

    return token; // Return the token for further use
}

module.exports = generateTokenAndSetCookie