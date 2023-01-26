// TODO: Server will crash if users are connected and trying to retrieve data on startup IF the db/table doesn't exist yet.
//       They will crash because the players are requesting data when it is still in the process of being created.

require("dotenv").config();
const fs = require("fs");
const socket = require("socket.io");
const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socket(server);
const { createLogger, format, transports } = require("winston");
// const winston = require("winston");
const dbOperations = require("./db/dbOperations.js");
const { fsyncSync } = require("fs");
const users = {};

const { combine, timestamp, printf } = format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [new transports.File({ filename: "standard.log" })],
});

dbOperations.createGamesTable("games");
dbOperations.createGamesTable("finished_games");

// Utilize winston to log events, mostly related to socket transactions.
logger.log({
  level: "info",
  message: "Server restarted successfully",
});

updateUsersFile();
function updateUsersFile() {
  const usersData = JSON.stringify(users, null, 3);
  fs.writeFile("./users.json", usersData, { flag: "w" }, (err) => {
    if (err) console.log(err);
    else {
      // Do something?
    }
  });
}

// Set static folder, set default extension so .html is not required in url
// Not sure if the use of 'path.join' in this way is necessary - static("./public-files/") should work ok?
app.use(express.static(path.join(__dirname, "/public-files/"), { extensions: ["html"] }));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Make sure rooms are used for all emits (and therefore in client JS). Not necessary with socket.emit - that only sends back to the sender of the original message.
io.on("connection", (socket) => {
  socket.emit("connected", "Connection successful. Socket ID: " + socket.id);
  // "remote-name" header and similar ones if used are for leveraging apps behind Authelia authentication service.
  // IP address was added for more info, so even if all users are "Unknown User", entries in users.json will differentiate by IP address and connection date/time
  socketUser = socket.handshake.headers["remote-name"] || "Unknown User";
  if (socketUser == "Unknown User") {
    socketUser += " - " + socket.handshake.headers["x-real-ip"];
  }
  users[socket.id] = { name: socketUser, ip: socket.handshake.headers["x-real-ip"], connected: Date() };
  // Handle disconnection
  socket.on("disconnect", async (reason) => {
    const sockets = await io.fetchSockets();
    // consider ignoring if reason == "transport close"?
    logger.log({
      level: "info",
      message: `user: ${users[socket.id].name} disconnected because ${reason}. ${sockets.length} connection(s) remaining`,
    });
    delete users[socket.id];
    updateUsersFile();
  });

  // Verify a unique game name was entered
  socket.on("check-name", async (gameId, callback) => {
    const result = await dbOperations.checkForGameId(gameId);
    callback(result);
  });

  socket.on("creating-game", async () => {
    socket.join("newGame");
    const newGameSockets = await io.in("newGame").fetchSockets();
    const sockets = await io.fetchSockets();
    users[socket.id].location = "creating game";
    updateUsersFile();
    logger.log({
      level: "info",
      message: `${users[socket.id].name} is creating a game. ${newGameSockets.length} total user(s) creating games. ${
        sockets.length
      } total connection(s)`,
    });
  });

  socket.on("game-lobby", async (gameId, gameStatus) => {
    socket.join(gameId);
    socket.join("game-lobby");
    const sockets = await io.fetchSockets();
    const thisGameSockets = await io.in(gameId).fetchSockets();
    var table = "games";
    if (gameStatus == "finished") {
      table = "finished_games";
    }
    let result = await dbOperations.getGame(gameId, table);
    socket.emit("game-data", result[0]);
    if (result.length == 0) {
      console.log(`invalid game lobby request for game ${gameId} by ${users[socket.id].name}`);
      return;
    }
    users[socket.id].location = "Lobby: " + gameId;
    updateUsersFile();
    logger.log({
      level: "info",
      message: `${users[socket.id].name} is in the lobby for game ID: ${gameId}. ${thisGameSockets.length} socket(s) in game, ${
        sockets.length
      } total connection(s)`,
    });
  });

  socket.on("game-load", async (gameId, playerNum, gameStatus) => {
    socket.join(gameId);
    const sockets = await io.fetchSockets();
    const thisGameSockets = await io.in(gameId).fetchSockets();
    let table = "games";
    if (gameStatus == "finished") table = "finished_games";
    let result = await dbOperations.getGame(gameId, table);
    socket.emit("game-data", result[0]);
    if (result.length == 0) {
      console.log(`invalid game request for game ${gameId} by ${users[socket.id].name}`);
      return;
    }
    const playerName = JSON.parse(result[0][`player_${playerNum}`]).name;
    users[socket.id].location = "In game: " + gameId;
    updateUsersFile();
    logger.log({
      level: "info",
      message: `${users[socket.id].name} joined game ID: ${gameId} as player ${playerNum} (${playerName}). ${
        thisGameSockets.length
      } socket(s) in game, ${sockets.length} total connection(s)`,
    });
  });

  socket.on("saved-game-request", async () => {
    socket.join("savedGames");
    const sockets = await io.fetchSockets();
    const savedGameSockets = await io.in("savedGames").fetchSockets();
    let result = await dbOperations.getSavedGames("games");
    socket.emit("saved-game-data", result);
    users[socket.id].location = "Saved games page";
    updateUsersFile();
    logger.log({
      level: "info",
      message: `${users[socket.id].name} is in the saved games page. ${savedGameSockets.length} total user(s) viewing saved games. ${
        sockets.length
      } total connection(s)`,
    });
  });

  socket.on("finished-game-request", async () => {
    let result = await dbOperations.getSavedGames("finished_games");
    socket.emit("finished-game-data", result);
  });

  socket.on("new-row", async (newRow) => {
    const gameId = newRow.game_id;
    const saveId = newRow.save_id;
    const players = newRow.players;
    const gameInfo = JSON.stringify(newRow.game_info);
    const nobles = JSON.stringify(newRow.nobles);
    const blueDeck = JSON.stringify(newRow.blue_deck);
    const yellowDeck = JSON.stringify(newRow.yellow_deck);
    const greenDeck = JSON.stringify(newRow.green_deck);
    const boardGems = JSON.stringify(newRow.board_gems);
    const p1 = JSON.stringify(newRow.player_1);
    const p2 = JSON.stringify(newRow.player_2);
    const p3 = JSON.stringify(newRow.player_3);
    const p4 = JSON.stringify(newRow.player_4);
    const result = await dbOperations.addGameRow(
      "games",
      gameId,
      saveId,
      players,
      gameInfo,
      nobles,
      blueDeck,
      yellowDeck,
      greenDeck,
      boardGems,
      p1,
      p2,
      p3,
      p4
    );
    // Delete rows from previous rounds - keep the first row of every round and 1 full round of turns prior to most recent row created.
    if (saveId.slice(0, -2) == "1" || saveId.slice(-1) == "2" || saveId == "2.1") {
      // Don't delete
    } else if (saveId.slice(-1) == "1") {
      // Delete last turn of previous round
      let round = parseInt(saveId.slice(0, -2)) - 1;
      let oldSaveId = round - 1 + "." + players;
      const deleteResult = await dbOperations.deleteRow(gameId, oldSaveId);
    } else {
      // Delete previous turn
      let turn = parseInt(saveId.slice(-1)) - 1;
      let round = saveId.slice(0, -2);
      let oldSaveId = round - 1 + "." + turn;
      const deleteResult = await dbOperations.deleteRow(gameId, oldSaveId);
    }
    // Send data to other clients in same game (unless this was the game creation row)
    if (saveId != "1.1") {
      socket.to(gameId).emit("new-row-result", newRow);
      logger.log({
        level: "verbose",
        message: "New row added and data sent to out-of-turn players in game ID: " + gameId + ", save ID: " + saveId,
      });
    } else {
      logger.log({
        level: "info",
        message: "New game created. Game ID: " + gameId,
      });
    }
  });

  socket.on("end-game", async (gameId) => {
    const gameData = await dbOperations.getGame(gameId);
    let finishedGame = gameData[0];
    const saveId = finishedGame.save_id;
    const players = finishedGame.players;
    let gameInfo = JSON.parse(finishedGame.game_info);
    const nobles = finishedGame.nobles;
    const blueDeck = finishedGame.blue_deck;
    const yellowDeck = finishedGame.yellow_deck;
    const greenDeck = finishedGame.green_deck;
    const boardGems = finishedGame.board_gems;
    const p1 = finishedGame.player_1;
    const p2 = finishedGame.player_2;
    const p3 = finishedGame.player_3;
    const p4 = finishedGame.player_4;
    gameInfo.status = "finished";
    gameInfo = JSON.stringify(gameInfo);
    const finished = await dbOperations.addGameRow(
      "finished_games",
      gameId,
      saveId,
      players,
      gameInfo,
      nobles,
      blueDeck,
      yellowDeck,
      greenDeck,
      boardGems,
      p1,
      p2,
      p3,
      p4
    );
    const deleted = await dbOperations.deleteGame(gameId);
    logger.log({
      level: "info",
      message: `Game: ${gameId} has ended. It has been moved to the saved games database.`,
    });
  });

  socket.on("game-over", async (gameId) => {
    socket.join(gameId);
    socket.join("game-over");
    const sockets = await io.fetchSockets();
    const thisGameSockets = await io.in(gameId).fetchSockets();
    let result = await dbOperations.getGame(gameId, "finished_games");
    socket.emit("game-data", result[0]);
    users[socket.id].location = "Game Over: " + gameId;
    updateUsersFile();
    logger.log({
      level: "info",
      message: `${users[socket.id].name} is in the Game Over page for game ID: ${gameId}. ${thisGameSockets.length} socket(s) in game, ${
        sockets.length
      } total connection(s)`,
    });
  });
});
