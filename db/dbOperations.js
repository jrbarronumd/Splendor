const knex = require("./knex.js");

async function createGamesTable() {
  await knex.schema.hasTable("games").then(function (exists) {
    if (!exists) {
      console.log(`"games" Table does not exist.  Must be created`);
      return knex.schema.createTable("games", function (table) {
        table.text("game_id");
        table.integer("save_id");
        table.integer("players");
        table.text("nobles");
        table.text("blue_deck");
        table.text("yellow_deck");
        table.text("green_deck");
        table.text("board_gems");
        table.text("player_1");
        table.json("player_2");
        table.text("player_3");
        table.text("player_4");
      });
    }
    console.log(`"games" Table exists - no action taken`);
  });
}

function createGame(gameId, players, saveId, nobles, blueDeck, yellowDeck, greenDeck, boardGems, p1, p2, p3, p4) {
  return knex("games").insert({
    game_id: gameId,
    players: players,
    save_id: saveId,
    nobles: nobles,
    blue_deck: blueDeck,
    yellow_deck: yellowDeck,
    green_deck: greenDeck,
    board_gems: boardGems,
    player_1: p1,
    player_2: p2,
    player_3: p3,
    player_4: p4,
  });
}

function getGame(gameId) {
  return knex("games").select("*").where("game_id", gameId);
}

function checkForGameId(gameId) {
  return knex("games").select("players").where("game_id", gameId);
}

module.exports = { createGamesTable, createGame, getGame, checkForGameId };
