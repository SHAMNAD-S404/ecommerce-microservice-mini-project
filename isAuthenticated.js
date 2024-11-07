
const jwt = require("jsonwebtoken")

export async function isAuth(req,res,next) {
    
    const token = req.headers['authorization'].split(" ")[1];

    jwt.verify(token,"secret",(err,user) => {
        if (err) {
            return res.status(400).json({error:err})
        } else {
            req.user = user;
            next();
        }
    })
}