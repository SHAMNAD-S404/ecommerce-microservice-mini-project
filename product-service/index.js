const express = require ("express");
const app = express ();
const PORT = process.env.AUTH_PORT || 5002;
const amqp = require ("amqplib");
const productDB = require ("./model/productModel");
const cookieParser = require ("cookie-parser");
const isAuth = require ('./utility/isAuthenticated');
const connectMongoDB = require ('./utility/mongoConnect')
const cors = require("cors")
const productController = require ("./controller/productControlller")
let channel, connection;

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log("msg received at product-service", req.method);
    next();
});

//setting up cors policy
app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true  // Required for cookies
}));


//connecting to mongodb
connectMongoDB.connect();


//connecting to rabbitmq and starting the server
async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT");

        console.log("Connected to RabbitMQ");

      
        channel.consume("PRODUCT", async (data) => {
            console.log("Consuming PRODUCT queue");
            const orders = JSON.parse(data.content);
            console.log("Order processed:", orders);
            channel.ack(data);


        });

        // Start the server after RabbitMQ is connected
       
    } catch (error) {
        console.error("Error connecting to RabbitMQ", error);
    }
}

connect();

// get products
app.get("/get", isAuth, productController.getProducts);

// add products
app.post('/create', isAuth, productController.createProducts);


//buy products
app.post('/buy', isAuth, async (req, res) => {

    const { ids } = req.body;
    const products = await productDB.find({ _id: { $in: ids } });

    if (!products || products.length === 0) {
        return res.status(400).json({ error: "Product with the given ID(s) does not exist" });
    }
  
    // Send order data to the ORDER queue
    if(channel){

      channel.sendToQueue("ORDER", Buffer.from(
        JSON.stringify({
            products,
            userEmail: req.user.email
        })
    ));

      console.log("msg sended to order que")
      
   }else{
        console.log("failed to send msg to que")
    }

    res.status(200).json({ success: "Order is being processed" });
});

 app.listen(PORT, () => {
            console.log(`Product service at http://localhost:${PORT}`);
        });
