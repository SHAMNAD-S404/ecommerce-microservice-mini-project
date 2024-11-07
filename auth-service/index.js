const express  = require("express")
const app      = express()
const mongoose = require("mongoose")
const PORT     = process.env.AUTH_PORT || 5001;

app.use(express.json())


mongoose.connect("mongodb://localhost/auth-service")
    .then(()=>{
        console.log("Auth Service DB connected.........");        
    })
    .catch((err)=>{
        console.error(err);        
    });


app.listen(PORT,()=>{
    console.log(`Auth service at http://localhost:${PORT}`);
})




