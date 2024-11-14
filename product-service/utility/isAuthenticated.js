const jwt = require("jsonwebtoken");


async function isAuth(req, res, next) {
    try {
        
        const token = req.cookies.token;

        if(!token)  return res.status(401).json({ error: "Token missing or invalid" });

        jwt.verify(token,"secret",(err,user) => {

            if(err){
                return res.status(403).json({error:"Token is invalid"})
            }

            req.user  = user;
            next();
        })

    } catch (error) {
        console.error("Error in isAuth middleware:", error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = isAuth;
