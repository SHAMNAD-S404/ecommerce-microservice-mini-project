const mongoose = require("mongoose");

function connect() {

    return mongoose
        .connect('mongodb://localhost/product-service')
        .then(() => console.log("Product Service DB is connected ..."))
        .catch((err) => console.error('error with connectin mongodb',err));
}

module.exports = {
    connect
}