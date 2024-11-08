const express   = require("express")
const app       = express()
const mongoose  = require("mongoose")
const PORT      = process.env.AUTH_PORT || 5002;
const jwt       = require("jsonwebtoken")
const amqp      = require("amqplib")
const productDB = require("./model/productModel")
const isAuth    = require('../isAuthenticated')
let channel, connection;

app.use(express.json())

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}

connect();

mongoose.connect("mongodb://localhost/product-service")
    .then(()=>{
        console.log("Product Service DB connected.........");        
    })
    .catch((err)=>{
        console.error(err);        
    });


app.post('/product/create',isAuth,async(req,res) => {

    const {name , description, price } = req.body;
    const newProduct = new productDB({
        name,
        description,
        price
    });

    newProduct.save();
    return res.status(200).json(newProduct)
})



app.listen(PORT,()=>{
    console.log(`Product service at http://localhost:${PORT}`);
})




