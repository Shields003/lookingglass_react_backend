const express = require("express");

const app = express();

app.get("/", function (req, res) {
  response.send("<h1>Hello World!</h1>");
});

app.get("/contact", function (req, res) {
  res.send("Contact me at: chris.shields@ymail.com");
});
app.get("/hobbies", function (req, res) {
  res.send("<ul>BJJ</ul><li>Games</li><li>Music lover</li>");
});

app.get("/about", function (req, res) {
  res.send(
    "I am me.  This is about me.  I am Chris Shields.  I am self aware."
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
