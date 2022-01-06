var playerNumberButtons = document.getElementsByClassName("radio-btn");
var createGameButton = document.getElementById("create-game-button");
var gameNameInput = document.getElementById("game-name");
var numberOfPlayers;
var gameId = "NoName";

gameNameInput.addEventListener("change", changeGameName);
createGameButton.addEventListener("click", createGame);

for (var i = 0; i < playerNumberButtons.length; i++) {
  var button = playerNumberButtons[i];
  button.addEventListener("change", changeNumberPlayers);
}

function changeNumberPlayers(event) {
  var buttonClicked = event.target;
  numberOfPlayers = parseInt(buttonClicked.getAttribute("value"));
  console.log(numberOfPlayers + " Players selected");
  var playerContainer = document.getElementsByClassName("player-name-container")[0];
  var playerDivs = playerContainer.getElementsByClassName("player-name");
  var currentPlayers = playerDivs.length;

  // Remove players if there are too many
  for (let i = currentPlayers; i >= 1; i--) {
    if (i > numberOfPlayers) {
      playerDivs[i - 1].remove();
    }
  }
  // Add players if there are not enough
  for (let i = 1; i <= numberOfPlayers; i++) {
    if (i > currentPlayers) {
      let newPlayerDiv = document.createElement("div");
      newPlayerDiv.classList.add("player-name", `player-${i}`);
      let newDivContents = `
        <div>
            <input type="text" placeholder="Player ${i} name" class="create-player"/>
        </div>`;
      newPlayerDiv.innerHTML = newDivContents;
      playerContainer.append(newPlayerDiv);
    }
  }
}

function changeGameName() {
  let gameLink = createGameButton.href;
  gameLink += "?gameid=" + gameId;
  createGameButton.href = gameLink;
  console.log(createGameButton.href);
}

function createGame() {
  // Do a bunch of stuff
}
