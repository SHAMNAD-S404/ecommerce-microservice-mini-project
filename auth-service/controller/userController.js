
const UserDB = require("../model/userModel");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
var channel, connection;


//connecting to rabbitMQ
async function connectRabitMQ() {
    try {
        const amqpServer = "amqp://rabbitmq:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        //here creating NOTIFICATION queue again have no problem its only recreate if its not exist
        await channel.assertQueue("NOTIFICATION");

    } catch (error) {
        console.error("failed to connect with rabbitmq , error:", error);
    }
};



//login function
const userLogin = async (req, res) => {

    try {

        const { email, password } = req.body;
        console.log(req.body);
        const user = await UserDB.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        if (password !== user.password) {
            return res.status(400).json({ error: "invalid credentials" });

        } else {

            const payload = {
                email,
                name: user.name,
            };

            jwt.sign(payload, "secret", (err, token) => {

                if (err) {
                    console.log(err);
                } else {

                     return res.cookie("token",token, {
                            httpOnly:true,
                            secure:false,
                            maxAge:3600000
                        })
                        .status(200).json({success:"Successfully logged !"})
                }
            });
        }

    } catch (error) {
        console.log(error);
    }
}

//signup function 
const userSignup = async (req, res) => {
    try {

        console.log(req.body);
        const { email, password, name } = req.body;
        const alreadyExist = await UserDB.findOne({ email });

        if (alreadyExist) {
            return res.json({ error: "User with the email id is already exist" });
        } else {
            const newUser = new UserDB({
                name,
                email,
                password,
            });
            newUser.save();

            const notificationData = {
                email,
                subject: "Welcome to our Service",
                message: `Hi ${name}, your account has been created successfully.`,
            };
            //send message to the NOTIFICATIN QUEUE
            if (channel) {
                console.log(channel);
                
                channel.sendToQueue(
                  "NOTIFICATION",
                  Buffer.from(JSON.stringify(notificationData))
                );
                console.log("Message was sent to notification queue");
              } else {
                console.error("RabbitMQ channel is not initialized!");
              }

            return res
                .status(200)
                .json({ success: "user created successfully", userName: newUser.name });
        }

    } catch (error) {
        console.error(error);

    }
}

const getUsers = async (req,res) => {
    try {
        const userData = await UserDB.find();
        return res.status(200).json({userData})
    } catch (error) {
        console.log(error);     
    }
}

module.exports = {
    userLogin,
    userSignup,
    connectRabitMQ,
    getUsers
}