const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.AUTH_PORT || 5002;
const amqp = require("amqplib");
const productDB = require("./model/productModel");
const cookieParser = require("cookie-parser");
const isAuth = require('./utility/isAuthenticated');
const cors = require('cors');
let channel, connection;

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    console.log("msg received at product-service", req.method);
    next();
});


//connecting to mongodb
mongoose.connect("mongodb://localhost/product-service")
    .then(() => {
        console.log("Product Service DB connected.........");
    })
    .catch((err) => {
        console.error(err);
    });

//connecting to rabbitmq and starting the server
async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT");

        console.log("Connected to RabbitMQ");

        // Move channel.consume here to set it up after the connection is ready
        channel.consume("PRODUCT", async (data) => {
            console.log("Consuming PRODUCT queue");
            const orders = JSON.parse(data.content);
            console.log("Order processed:", orders);
            channel.ack(data);

            // Further order processing can be handled here
        });

        // Start the server after RabbitMQ is connected
        app.listen(PORT, () => {
            console.log(`Product service at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to RabbitMQ", error);
    }
}

connect();

// Define routes
app.get("/get", isAuth, async (req, res) => {
    const products = await productDB.find();
    return res.status(200).json(products);
});

app.post('/create', isAuth, async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new productDB({
        name,
        description,
        price
    });

    newProduct.save();
    return res.status(200).json({ success: `${newProduct.name} : product was added successfully!` });
});

app.post('/buy', isAuth, async (req, res) => {
    console.log("inside buy");

    const { ids } = req.body;
    const products = await productDB.find({ _id: { $in: ids } });

    if (!products || products.length === 0) {
        return res.status(400).json({ error: "Product with the given ID(s) does not exist" });
    }

    // Send order data to the ORDER queue
    channel.sendToQueue("ORDER", Buffer.from(
        JSON.stringify({
            products,
            userEmail: req.user.email
        })
    ));

    // Send a response immediately after sending the order to the queue
    res.status(200).json({ success: "Order is being processed" });
});
