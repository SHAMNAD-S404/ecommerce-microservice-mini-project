
import express from "express";
import amqp    from "amqplib";
import {sendMail} from "./utility/nodemailer.js"
const app  = express()
const PORT = process.env.NOTIFICATION_PORT || 5004;
let channel , connection ;

app.use(express.json());


//connecting to rabbitmq
const connect  = async () => {
    try {
        
         const amqpServer = "amqp://localhost:5672";
         connection = await amqp.connect(amqpServer)
         channel    = await connection.createChannel();
         await channel.assertQueue("NOTIFICATION")

    } catch (error) {
        console.log('failed to connect to rabbitmq',error);        
    }
}

connect()
    .then(async()=> {

        channel.consume("NOTIFICATION" , async(data) => {
            console.log("Data recieved to notification queue");
            const {email,subject,message} = JSON.parse(data.content)
            await sendMail(email,subject,message);
            channel.ack(data);
            console.log("message acknowledged by notification service");
            

        })

    })
    .catch((err)=> console.log(err));



    app.listen(PORT,()=> {
        console.log(`Notification service is running on http://localhost:${PORT}`);   
    });