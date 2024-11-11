const mongoose = require("mongoose");

function connect() {
    
  return mongoose
    .connect("mongodb://localhost/auth-service")
    .then(() => {
      console.log("Auth Service DB connected.........");
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = {
  connect,
};
