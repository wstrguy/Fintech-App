// importing dotenv
const dotenv = require("dotenv").config();

// importing express
const express = require("express");

// importing routes
const userRoutes = require("./routes/user.routes");
const cookieparser = require("cookie-parser") 


// creating an instance for express
const app = express();

// middleware
app.use(express.json());
app.use(cookieparser());

app.use("/api", userRoutes);









module.exports = app;