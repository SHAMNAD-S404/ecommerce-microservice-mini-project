const express = require("express");
const app = express();
const {connect} = require("./utility/mongo")
const PORT = process.env.AUTH_PORT || 5001;
const cors = require("cors")
const userController = require("./controller/userController")


app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use((req,res,next) => {
  console.log("req recieved in auth service ", req.method)
})


//setting up cors policy
app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true  // Required for cookies
}));


//connection to rabbitMQ
userController.connectRabitMQ();


//user sign-in
app.post("/login", userController.userLogin);

//user signup
app.post("/register", userController.userSignup);

//connecting to mongodb 
connect();

app.listen(PORT, () => {
  console.log(`Auth service at http://localhost:${PORT}`);
});
