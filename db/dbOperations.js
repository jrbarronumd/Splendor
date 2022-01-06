const sqlite3 = require("sqlite3").verbose();
var db;

function dbInitialize() {
  // Open the database if it exists, create then open if it doesn't exist
  db = new sqlite3.Database("./db/games.db", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Initial connection to the database.");
  });
}

function dbClose() {
  // Close the db connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("db connection closed");
  });
}

function createTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS games(
    game_id text,
    save_id integer,
    players integer,
    nobles text,
    board text,
    blue_deck text,
    yellow_deck text,
    green_deck text,
    player_1 text,
    player_2 text,
    player_3 text,
    player_4 text)`,
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("games table created");
    }
  );
}

function addRow(gameId, saveId, players) {
  const sql = `INSERT INTO games(game_id, save_id, players) VALUES (?, ?, ?)`;
  const data = [`${gameId}`, `${saveId}`, `${players}`];
  db.run(sql, data, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log(`Row added for Game ${gameId}, save ID ${saveId}`);
  });
}

function addData(gameId, saveId, column, newData) {
  const sql = `UPDATE games
    SET ${column} = ?
    WHERE game_id = ? AND save_id = ?`;
  const data = [`${newData}`, `${gameId}`, `${saveId}`];
  db.run(sql, data, (err) => {
    if (err) {
      return console.log(err.message);
    }
  });
}

module.exports = { dbInitialize, dbClose, createTable, addRow, addData };
