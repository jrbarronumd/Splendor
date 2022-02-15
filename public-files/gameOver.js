// Game Over

const socket = io();
var gameData, numberOfPlayers, p1Data, p2Data, p3Data, p4Data, gameInfo;
var allPlayers = {};
let scoreOrder = [];
let myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");
var activePlayer = parseInt(myQueryString.get("p").slice(-1));

// As soon as connection is made, join user to the game's socket room, which will initiate game data push
socket.on("connect", () => {
  socket.emit("game-over", gameId);
});

// When connection is confirmed by server, log socket ID to console
socket.on("connected", (result) => {
  console.log(result);
});

// Server pushed gameData after connection.
socket.on("game-data", (respData) => {
  gameData = respData;
  p1Data = JSON.parse(gameData.player_1);
  p2Data = JSON.parse(gameData.player_2);
  p3Data = JSON.parse(gameData.player_3);
  p4Data = JSON.parse(gameData.player_4);
  allPlayers = { p1Data, p2Data, p3Data, p4Data };
  gameInfo = JSON.parse(gameData.game_info);
  numberOfPlayers = JSON.parse(gameData.players);
  initiatePage();
});

function initiatePage() {
  if (gameInfo.winner.length == 1) {
    singleWinner();
  } else if (gameInfo.winner.length > 1) {
    tieGame();
  }
  // Create an object with player numbers and scores to sort and list scores in order on the page
  for (let i = 0; i < numberOfPlayers; i++) {
    scoreOrder[i] = {};
    scoreOrder[i].player = i + 1;
    scoreOrder[i].score = allPlayers[`p${i + 1}Data`].points;
  }
  scoreOrder.sort((a, b) => b.score - a.score);
  standardContent();
}

function standardContent() {
  for (let i = 0; i < numberOfPlayers; i++) {
    let player = scoreOrder[i].player;
    let scoresContainer = document.getElementById("scores-container");
    let playerName = allPlayers[`p${player}Data`].name;
    let playerScore = allPlayers[`p${player}Data`].points;
    let newContents = `<li class="player-end player-${player}">${playerName}'s Score: ${playerScore}</li>`;
    scoresContainer.innerHTML += newContents;
  }
}

function singleWinner() {
  let winnerName = allPlayers[`p${gameInfo.winner[0]}Data`].name;
  document.getElementById("winner-announcement").innerText = `${winnerName} has won the game`;
  document.getElementById("winner-announcement").classList.add(`player-${gameInfo.winner[0]}`);
}

function tieGame() {
  document.getElementById("winner-announcement").innerText = `Go kiss your sister.  This game ended in a tie. BOOOOOOO!`;
}
