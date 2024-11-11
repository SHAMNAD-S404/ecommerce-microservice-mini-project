
const UserDB = require("../model/userModel");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
let channel, connection;


//connecting to rabbitMQ
async function connectRabitMQ() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        //here creating NOTIFICATION queue again have no problem its only recreate if its not exist
        await channel.assertQueue("NOTIFICATION");

    } catch (error) {
        console.error("failed to connect with rabbitmq , error:", error);
    }
};


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

                    return res
                        .status(200)
                        .json({ success: "successfully logged in ", token: token });
                }
            });
        }

    } catch (error) {
        console.log(error);

    }
}


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
            channel.sendToQueue(
                "NOTIFICATION",
                Buffer.from(JSON.stringify(notificationData))
            );
            console.log("Message was sended to notification queue ");

            return res
                .status(200)
                .json({ success: "user created successfully", userName: newUser.name });
        }

    } catch (error) {
        console.error(error);

    }
}

module.exports = {
    userLogin,
    userSignup,
    connectRabitMQ
}