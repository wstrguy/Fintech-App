const app = require("./app");
const connDb = require("./database/db");

app.get("/", (req, res) => {
    res.send("Welcome to the home page")
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Server is now running");
    connDb();
})