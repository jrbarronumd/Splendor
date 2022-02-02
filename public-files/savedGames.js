// Saved game listing

const socket = io();
var gameData;

// Request saved game data
function requestGames() {
  socket.emit("saved-game-request");
}

socket.on("connected", (message) => {
  console.log(message);
  requestGames();
});

// Upon receiving the data from the server
socket.on("saved-game-data", (savedGameData) => {
  gameData = savedGameData;
  //  In case this is a reconnect, and the list has already rendered.
  const parent = document.getElementsByClassName("games-list")[0];
  while (parent.firstChild) {
    parent.firstChild.remove();
  }
  loadPageInfo();
});

function loadPageInfo() {
  let rows = gameData.length;
  console.log(rows + " games to load");
  const gamesList = document.getElementsByClassName("games-list")[0];
  for (var i = rows - 1; i >= 0; i--) {
    // Create list item to hold each game (newest first)
    let gameId = gameData[i].game_id;
    let newGameLI = document.createElement("li");
    newGameLI.classList.add("saved-game");
    newGameLI.innerHTML = `<a href="gameLobby?game_id=${gameId}">game id - ${gameId}: </a>`;
    gamesList.appendChild(newGameLI);
    // Create span for each list of players, then one for each player name in each game
    let newGameSpan = document.createElement("span");
    newGameSpan.classList.add("players-box");
    newGameLI.append(newGameSpan);
    let players = gameData[i].players;
    var playerNames = [gameData[i].player_1, gameData[i].player_2, gameData[i].player_3, gameData[i].player_4];
    for (var j = 1; j <= players; j++) {
      let newPlayerSpan = document.createElement("span");
      newPlayerSpan.classList.add(`player-${j}`, "saved-game-player");
      newPlayerSpan.innerHTML = `<a href="game?game_id=${gameId}&p=p${j}">${JSON.parse(playerNames[j - 1]).name}</a>`;
      newGameSpan.append(newPlayerSpan);
    }
    let dateSpan = document.createElement("span");
    let date = new Date(gameData[i].date_created);
    date = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);
    dateSpan.classList.add("date-created");
    dateSpan.innerText = `Created - ${date}`;
    newGameLI.appendChild(dateSpan);
  }
}
