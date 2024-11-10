const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.AUTH_PORT || 5001;
const UserDB = require("./model/userModel");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const axios = require("axios");
let channel, connection;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.static("public"));

//connecting to rabbitMQ
const connectRabitMQ = async () => {
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

connectRabitMQ();

//render login page
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/auth/login", (req, res) => {
  res.redirect("/");
});

//user sign-in
app.post("/auth/login", async (req, res) => {
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
    console.error(error);
  }
});

//user signup
app.post("/auth/register", async (req, res) => {
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
});

mongoose
  .connect("mongodb://localhost/auth-service")
  .then(() => {
    console.log("Auth Service DB connected.........");
  })
  .catch((err) => {
    console.error(err);
  });

app.listen(PORT, () => {
  console.log(`Auth service at http://localhost:${PORT}`);
});
