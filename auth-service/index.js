const express = require("express");
const app = express();
const {connect} = require("./utility/mongo")
const PORT = process.env.AUTH_PORT || 5001;
const cors = require("cors")
const userController = require("./controller/userController")


app.use(express.json())
app.use(express.urlencoded({ extended: true })); 

//setting up cors policy
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST','PUT'],
  allowedHeaders: '*',
}));


//connection to rabbitMQ
userController.connectRabitMQ();


//user sign-in
app.post("/login", userController.userLogin);

//user signup
app.post("/auth/register", userController.userSignup);

//connecting to mongodb 
connect();

app.listen(PORT, () => {
  console.log(`Auth service at http://localhost:${PORT}`);
});
