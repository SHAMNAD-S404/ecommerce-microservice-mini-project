const jwt = require("jsonwebtoken");

async function isAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token missing" });
        }

        jwt.verify(token, "secret", (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Token is invalid" });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Error in isAuth middleware:", error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = isAuth;
