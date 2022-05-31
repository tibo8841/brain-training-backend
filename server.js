const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;
const { Client } = require("pg");

const connectionString =
  "postgres://xtvjajky:1I2LmKlHwfx8RgKOYf6N-81Gg4eRUH_J@tyke.db.elephantsql.com/xtvjajky";

const client = new Client(connectionString);
client.connect();

app.use(cors());

app.get("/", (req, res) => {
  let result = client.query("SELECT * FROM users");
  res.json(result);
});

app.get("/all-origins", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.listen(80, function () {
  console.log("CORS-enabled web server listening on port 80");
});
