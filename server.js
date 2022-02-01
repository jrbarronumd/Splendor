// TODO: Server will crash if users are connected and trying to retrieve data on startup IF the db/table doesn't exist yet.
//       They will crash because the players are requesting data when it is still in the process of being created.

const socket = require("socket.io");
const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8585;
const app = express();
const server = http.createServer(app);
const io = socket(server);
const dbOperations = require("./db/dbOperations.js");

dbOperations.createGamesTable();

// Set static folder, set default extension so .html is not required in url
// Not sure if the use of 'path.join' in this way is necessary - static("./public-files/") should work ok?
app.use(express.static(path.join(__dirname, "/public-files/"), { extensions: ["html"] }));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Make sure rooms are used for all emits (and therefore in client JS). Not necessary with socket.emit - that only sends back to the sender of the original message.
io.on("connection", (socket) => {
  // console.log("user connected: " + socket.id);
  socket.emit("connected", "Connection successful. Socket ID: " + socket.id);

  // Handle disconnection
  socket.on("disconnect", async (reason) => {
    const sockets = await io.fetchSockets();
    console.log(`user: ${socket.id} disconnected because ${reason}. ${sockets.length} connection(s) remaining`);
  });

  // Used to verify a unique game name was entered
  socket.on("check-name", async (gameId, callback) => {
    const result = await dbOperations.checkForGameId(gameId);
    callback(result);
  });

  socket.on("creating-game", async () => {
    socket.join("newGame");
    const newGameSockets = await io.in("newGame").fetchSockets();
    const sockets = await io.fetchSockets();
    console.log(`User ${socket.id} is creating a game. ${newGameSockets.length} total user(s) creating games. ${sockets.length} total connection(s)`);
  });

  socket.on("game-lobby", async (gameId) => {
    socket.join(gameId);
    socket.join("game-lobby");
    const sockets = await io.fetchSockets();
    const thisGameSockets = await io.in(gameId).fetchSockets();
    let result = await dbOperations.getGame(gameId);
    socket.emit("game-data", result[0]);
    console.log(
      `User ${socket.id} is in the lobby for game ID: ${gameId}. ${thisGameSockets.length} socket(s) in game, ${sockets.length} total connection(s)`
    );
  });

  socket.on("game-load", async (gameId, playerNum) => {
    socket.join(gameId);
    const sockets = await io.fetchSockets();
    const thisGameSockets = await io.in(gameId).fetchSockets();
    let result = await dbOperations.getGame(gameId);
    socket.emit("game-data", result[0]);
    const playerName = JSON.parse(result[0][`player_${playerNum}`]).name;
    console.log(
      `User ${socket.id} joined game ID: ${gameId} as player ${playerNum} (${playerName}). ${thisGameSockets.length} socket(s) in game, ${sockets.length} total connection(s)`
    );
  });

  socket.on("saved-game-request", async () => {
    socket.join("savedGames");
    const sockets = await io.fetchSockets();
    const savedGameSockets = await io.in("savedGames").fetchSockets();
    let result = await dbOperations.getSavedGames();
    socket.emit("saved-game-data", result);
    console.log(
      `User ${socket.id} is in the saved games page. ${savedGameSockets.length} total user(s) viewing saved games. ${sockets.length} total connection(s)`
    );
  });

  socket.on("new-row", async (newRow) => {
    const gameId = newRow.game_id;
    const players = newRow.players;
    const saveId = newRow.save_id;
    const nobles = JSON.stringify(newRow.nobles);
    const blueDeck = JSON.stringify(newRow.blue_deck);
    const yellowDeck = JSON.stringify(newRow.yellow_deck);
    const greenDeck = JSON.stringify(newRow.green_deck);
    const boardGems = JSON.stringify(newRow.board_gems);
    const p1 = JSON.stringify(newRow.player_1);
    const p2 = JSON.stringify(newRow.player_2);
    const p3 = JSON.stringify(newRow.player_3);
    const p4 = JSON.stringify(newRow.player_4);
    const result = await dbOperations.addGameRow(gameId, players, saveId, nobles, blueDeck, yellowDeck, greenDeck, boardGems, p1, p2, p3, p4);
    // Send data to other clients in same game (unless this was the game creation row)
    if (saveId != "1.1") {
      socket.to(gameId).emit("new-row-result", newRow);
      console.log("New row added and data sent to out-of-turn players in game ID: " + gameId + ", save ID: " + saveId);
    } else {
      console.log("New game created. Game ID: " + gameId);
    }
  });
});
