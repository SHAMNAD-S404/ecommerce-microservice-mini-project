const express = require("express");
const app = express();
const PORT = process.env.ORDER_PORT || 5003;
const mongoose = require("mongoose");
const orderDB = require("./model/orderModel");
const amqp = require("amqplib");
let channel, connection;

app.use(express.json());

//to create order
function createOrder(products, userEmail) {
  //to find total price
  let total = 0;
  for (let t = 0; t < products.length; t++) {
    total += products[t].price;
  }

  const newOrder = new orderDB({
    products,
    user: userEmail,
    total_price: total,
  });

  newOrder.save();
  return newOrder;
}

//connecting to rabbitmq using amqplib
const connect = async () => {
  try {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
  } catch (error) {
    console.error(error);
  }
};

//listining to Order queue
connect().then(async () => {

  channel.consume("ORDER", async (data) => {

    console.log("consuming order queue");
    const { products, userEmail } = JSON.parse(data.content);
    const newOrder = await createOrder(products, userEmail);
    channel.ack(data);

    //sending message to product queue
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
    
    //sending message to notification queue
    channel.sendToQueue(
      "NOTIFICATION",
      Buffer.from(
        JSON.stringify({
          email: newOrder.user,
          subject: "Order placed successfully",
          message: `You are order  successfully  placed with the total amount of ${newOrder.total_price} `,
        })
      )
    );
  });
});

//connecting db
mongoose
  .connect("mongodb://localhost/order-service")
  .then(() => {
    console.log("order service db is connected .....");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Product service at http://localhost:${PORT}`);
});
