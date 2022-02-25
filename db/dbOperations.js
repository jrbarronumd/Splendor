const knex = require("./knex.js");

async function createGamesTable(tableName) {
  await knex.schema.hasTable(tableName).then(function (exists) {
    if (!exists) {
      console.log(`"${tableName}" Table does not exist.  Must be created`);
      return knex.schema.createTable(tableName, function (table) {
        table.text("game_id");
        table.real("save_id");
        table.integer("players");
        table.text("game_info");
        table.text("nobles");
        table.text("blue_deck");
        table.text("yellow_deck");
        table.text("green_deck");
        table.text("board_gems");
        table.text("player_1");
        table.text("player_2");
        table.text("player_3");
        table.text("player_4");
        table.text("date_created");
      });
    }
    console.log(`"${tableName}" Table exists - no action taken`);
  });
}

function checkForGameId(gameId) {
  return knex("games").select("players").where("game_id", gameId);
}

function addGameRow(table, gameId, saveId, players, gameInfo, nobles, blueDeck, yellowDeck, greenDeck, boardGems, p1, p2, p3, p4) {
  return knex(table).insert({
    game_id: gameId,
    save_id: saveId,
    players: players,
    game_info: gameInfo,
    nobles: nobles,
    blue_deck: blueDeck,
    yellow_deck: yellowDeck,
    green_deck: greenDeck,
    board_gems: boardGems,
    player_1: p1,
    player_2: p2,
    player_3: p3,
    player_4: p4,
    date_created: Date(),
  });
}

function getGame(gameId, table = "games") {
  return knex(table).select("*").where("game_id", gameId).orderBy("date_created", "desc").limit(1);
}

function getSavedGames() {
  return knex("games").select("game_id", "players", "player_1", "player_2", "player_3", "player_4", "date_created").where("save_id", "1.1");
}

function deleteRow(gameId, saveId) {
  return knex("games")
    .where({
      game_id: gameId,
      save_id: saveId,
    })
    .del();
}

function deleteGame(gameId) {
  console.log(`Game: "${gameId}" moved to the finished games db table.`);
  return knex("games").where("game_id", gameId).del();
}

module.exports = { createGamesTable, addGameRow, getGame, getSavedGames, checkForGameId, deleteRow, deleteGame };
