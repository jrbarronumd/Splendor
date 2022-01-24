const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8585;
const app = express();
const server = http.createServer(app);
const dbOperations = require("./db/dbOperations.js");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

dbOperations.createGamesTable();

// Used to verify a unique game name was entered
app.post("/api/db/checkName", async (req, res) => {
  const gameId = req.body.game_id;
  const result = await dbOperations.checkForGameId(gameId);
  res.status(200).json(result);
});

// Creating a new game entry in the database
app.post("/api/db/newRow", async (req, res) => {
  const gameId = req.body.gameId;
  const players = req.body.players;
  const saveId = req.body.saveId;
  const nobles = JSON.stringify(req.body.nobles);
  const blueDeck = JSON.stringify(req.body.blueDeck);
  const yellowDeck = JSON.stringify(req.body.yellowDeck);
  const greenDeck = JSON.stringify(req.body.greenDeck);
  const boardGems = JSON.stringify(req.body.boardGems);
  const p1 = JSON.stringify(req.body.p1);
  const p2 = JSON.stringify(req.body.p2);
  const p3 = JSON.stringify(req.body.p3);
  const p4 = JSON.stringify(req.body.p4);
  const result = await dbOperations.createGame(gameId, players, saveId, nobles, blueDeck, yellowDeck, greenDeck, boardGems, p1, p2, p3, p4);
  console.log(`Row for game ${gameId} added to database`);
  res.status(201).json(result);
});

app.get("/api/db/getGame", async (req, res) => {
  const gameId = req.query.game_id;
  let result = await dbOperations.getGame(gameId);
  let rows = result.length;
  res.status(200).json(result[rows - 1]); // (only one row necessary - last row in this case)
});

app.get("/api/db/savedGames", async (req, res) => {
  let result = await dbOperations.getSavedGames();
  res.status(200).json(result);
});

app.post("/api/db/newRow", async (req, res) => {
  const gameId = "my-game-2";
  const result = await dbOperations.createGame();
  res.status(201).json(result);
});

// Set static folder, set default extension so .html is not required in url
// Not sure if the use of 'path.join' in this way is necessary - static("./public-files/") should work ok?
app.use(express.static(path.join(__dirname, "/public-files/"), { extensions: ["html"] }));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
