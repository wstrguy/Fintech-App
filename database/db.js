const mongoose = require("mongoose");

mongoose.set('strictQuery', false);
const connDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected Successfully...");
    } catch (error) {
        console.log("Error from Db");
    }
};

module.exports = connDb;
