const express = require("express");
const app = express();
const {connect} = require("./utility/mongo")
const PORT = process.env.AUTH_PORT || 5001;
const cors = require("cors")
const userController = require("./controller/userController")


app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use((req,res,next) => {
  console.log("req recieved in auth service ", req.method , req.path)
  next()
})


//setting up cors policy 
app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true  // Required for cookies
}));


//user sign-in api
app.post("/login", userController.userLogin);

//user signup api
app.post("/register", userController.userSignup);

//get users api
app.get("/get",userController.getUsers)


//connecting to mongodb 
connect();

// Connect to RabbitMQ before starting the server
userController.connectRabitMQ().then(() => {
  console.log("RabbitMQ connected!");
  app.listen(5001, () => console.log("Auth service running on port 5001"));
}).catch(err => {
  console.error("Failed to connect RabbitMQ:", err);
})
