// Game Lobby
var numberOfPlayers, gameData;
let myQueryString = new URLSearchParams(window.location.search);
let gameId = myQueryString.get("game_id");

getGameInfo();
function getGameInfo() {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("GET", `/api/db/lobby?game_id=${gameId}`);
  xhr.send();
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      gameData = xhr.response;
      numberOfPlayers = JSON.parse(gameData.players);
      loadPageInfo();
    }
  };
}

function loadPageInfo() {
  var linkContainer = document.getElementsByClassName("link-container")[0];
  let playerNames = [gameData.player_1, gameData.player_2, gameData.player_3, gameData.player_4];
  //TODO: kill these next 2 lines and do 2 'for' loops - one to just create divs 3-4, and then one to alter the data of all of them
  linkContainer.children[0].children[0].innerText = JSON.parse(playerNames[0]).name;
  linkContainer.children[1].children[0].innerText = JSON.parse(playerNames[1]).name;
  for (var i = 3; i <= numberOfPlayers; i++) {
    let name = JSON.parse(playerNames[i - 1]).name;
    console.log(name);
    var newPlayerDiv = document.createElement("div");
    newPlayerDiv.classList.add("player-link", `player-${i}`);
    let newDivContents = `<a href="gamePlay">${name}</a>`;
    newPlayerDiv.innerHTML = newDivContents;
    linkContainer.append(newPlayerDiv);
  }
}
