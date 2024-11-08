const express   = require("express")
const app       = express()
const mongoose  = require("mongoose")
const PORT      = process.env.AUTH_PORT || 5002;
const jwt       = require("jsonwebtoken")
const amqp      = require("amqplib")
const productDB = require("./model/productModel")
const isAuth    = require('../isAuthenticated')
let channel, connection;
let order;

app.use(express.json())

//connecting to rabbitmq using amqplib
async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}

connect();

//connecting to mongodb
mongoose.connect("mongodb://localhost/product-service")
    .then(()=>{
        console.log("Product Service DB connected.........");        
    })
    .catch((err)=>{
        console.error(err);        
    });

// add products
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

//buy products

app.post('/product/buy', isAuth , async(req,res) => {
    const { ids } = req.body;
    const products = await productDB.find({_id:{ $in:ids } });

    if( !products ) return res.status(400).json({error:"product with id didn't exist"})
    
    //send to order queue to save the order details
    channel.sendToQueue("ORDER",Buffer.from(
        JSON.stringify({
            products,
            userEmail:req.user.email
        })
    )  );

    //consuming from the product channel
    channel.consume("PRODUCT",(data) => {
        console.log("consuming PRODUCT queue");      
        order = JSON.parse(data.content);
        channel.ack(data)
    });
    return res.json(order)
});


app.listen(PORT,()=>{
    console.log(`Product service at http://localhost:${PORT}`);
})




