const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8585;
const app = express();
const server = http.createServer(app);
var bodyParser = require("body-parser");
const dbOperations = require("./db/dbOperations.js");

dbOperations.dbInitialize();
dbOperations.createTable();
dbOperations.dbClose();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/db/", (req, res) => {
  dbOperations.dbInitialize();
  dbOperations.addRow("ID1", req.body.id, req.body.players);
  res.json({
    message: "success",
  });
  dbOperations.dbClose();
});

//dbOperations.addRow("game_id", save_id, players);
//dbOperations.addData("1A", 0, "blue_deck", "other text here");

// Set static folder, set default extension so .html is not required in url
// Not sure if the use of 'path.join' in this way is necessary - static("./public-files/") should work ok?
app.use(express.static(path.join(__dirname, "/public-files/"), { extensions: ["html"] }));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
