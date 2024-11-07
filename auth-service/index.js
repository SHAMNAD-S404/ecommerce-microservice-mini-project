const express  = require("express")
const app      = express()
const mongoose = require("mongoose")
const PORT     = process.env.AUTH_PORT || 5001;
const UserDB   = require("./model/userModel");
const jwt      = require("jsonwebtoken")

app.use(express.json())

//user sign-in

app.post ("/auth/login" ,async(req,res) => {
    try {
        const {email,password} = req.body;
        const user  = await UserDB.findOne({email});

        if(!user) return res.status(400).json({error:"Invalid credentials"})
        
        if(password !== user.password){
            return res.status(400).json({error:"invalid credentials"})
        }else{

            const payload = {
                email,
                name:user.name
            };

            jwt.sign(payload,"secret",(err,token) => {
                if (err) {
                    console.log(err);                    
                } else {
                    return res.status(200).json({success:"successfully logged in ", token:token})
                }
            })
        }

    } catch (error) {
        console.error(error);        
    }
})



//user signup 
app.post ("/auth/register", async (req,res) => {
    const {email,password,name} = req.body;

    const alreadyExist = await UserDB.findOne({email});
    if (alreadyExist) {
        return res.json({error:"User with the email id is already exist"})
    } else {
        
        const newUser = new UserDB({
            name,
            email,
            password
        })
        newUser.save();
        return res.status(200).json({success:"user created successfully" , userName:newUser.name});
    }

})




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




