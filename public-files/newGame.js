import NoblesDeck from "./decks/noblesDeck.js";
import CardsDeck from "./decks/cardDeck.js";

var playerNumberButtons = document.getElementsByClassName("radio-btn");
var createGameButton = document.getElementById("create-game-button");
var gameNameInput = document.getElementById("game-name");
var playerNameInput = document.getElementsByClassName("create-player");
let baseGameLink = createGameButton.href;
var numberOfPlayers = 2;
let gameLink, gameId;
var startingGems = [0, 0, 4, 5, 7]; // simple but ugly way of setting number of gems (i.e. with  3 players, startingGems[3] = 5 gems). Seems like JSON values should be possible to utilize...
var playerNames = ["Player 1", "Player 2", "Player 3", "Player 4"];

//generate random game ID
var randomGameId = Math.floor(Math.random() * 65535);
randomGameId = randomGameId.toString(16);
gameId = randomGameId;

// Add event listeners
gameNameInput.addEventListener("change", changeGameName);
createGameButton.addEventListener("click", createGame);

for (var i = 0; i < playerNumberButtons.length; i++) {
  var button = playerNumberButtons[i];
  button.addEventListener("change", changeNumberPlayers);
}

for (var i = 0; i < playerNameInput.length; i++) {
  var input = playerNameInput[i];
  input.addEventListener("change", changePlayerName);
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
            <input type="text" placeholder="Player ${i} name" id="player-name-${i}" class="create-player"/>
        </div>`;
      newPlayerDiv.innerHTML = newDivContents;
      playerContainer.append(newPlayerDiv);
    }
  }
  // Recreate event listeners
  for (var i = 0; i < playerNameInput.length; i++) {
    var input = playerNameInput[i];
    input.addEventListener("change", changePlayerName);
  }
}

function changePlayerName(event) {
  let inputChanged = event.target;
  let name = inputChanged.value;
  let playerNum = parseInt(inputChanged.id.slice(-1)) - 1;

  if (name != "") {
    if (name.search(/[^A-Za-z0-9/\s]/g) > 0) {
      // (if user enters anything other than letters, numbers, or spaces)
      alert("Please don't use any weird characters in the Player Names");
      inputChanged.value = "";
      playerNames[playerNum] = `Player ${playerNum}`;
    } else {
      playerNames[playerNum] = name;
    }
  } else {
    inputChanged.value = "";
    playerNames[playerNum] = `Player ${playerNum}`;
  }
}

function changeGameName() {
  if (gameNameInput.value != "") {
    gameId = gameNameInput.value;
    if (gameId.search(/[^A-Za-z0-9/\s]/g) > 0) {
      // (if user enters anything other than letters, numbers, or spaces)
      gameId = randomGameId;
      alert("Please don't use any weird characters in the game name");
      gameNameInput.value = "";
      return;
    }
    gameId = gameId.replace(/[^A-Za-z0-9]+/g, "-"); // Replace any non-alphanumeric (should only be spaces after previous check) with "-"
    gameId = gameId.toLowerCase(); // Convert to lower case so there is no confusion with database
    // Check for existing game with same name
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("POST", "/api/db/checkName");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ game_id: gameId }));
    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.response[0]) {
          // Will be true if duplicate game found.
          gameId = randomGameId;
          alert("Duplicate game name.  Please try again.");
          gameNameInput.value = "";
          return;
        }
      }
    };
  } else {
    gameId = randomGameId;
  }
}
var blankPlayer = {
  name: "Place Holder",
  order: 0,
  points: 0,
  gems: {
    gold: 0,
    white: 0,
    blue: 0,
    green: 0,
    red: 0,
    black: 0,
  },
  bonus: {
    gold: 0,
    white: 0,
    blue: 0,
    green: 0,
    red: 0,
    black: 0,
  },
  reserved_cards: [],
  purchased_cards: [],
};

function createGame(event) {
  event.preventDefault();
  playerNames.splice(numberOfPlayers);
  let noblesDeck = new NoblesDeck();
  let blueDeck = new CardsDeck();
  let yellowDeck = new CardsDeck();
  let greenDeck = new CardsDeck();

  let p1Data = JSON.parse(JSON.stringify(blankPlayer));
  p1Data.name = playerNames[0];
  p1Data.order = 1;
  let p2Data = JSON.parse(JSON.stringify(blankPlayer));
  p2Data.name = playerNames[1];
  p2Data.order = 2;
  let p3Data = {};
  if (numberOfPlayers > 2) {
    p3Data = JSON.parse(JSON.stringify(blankPlayer));
    p3Data.name = playerNames[2];
    p3Data.order = 3;
  }
  let p4Data = {};
  if (numberOfPlayers > 3) {
    p4Data = JSON.parse(JSON.stringify(blankPlayer));
    p4Data.name = playerNames[3];
    p4Data.order = 4;
  }

  blueDeck.blueDeck();
  yellowDeck.yellowDeck();
  greenDeck.greenDeck();
  noblesDeck.shuffle();
  blueDeck.shuffle();
  yellowDeck.shuffle();
  greenDeck.shuffle();
  noblesDeck.deal(numberOfPlayers + 1);
  var xhr = new XMLHttpRequest();
  var body = {
    gameId: gameId,
    players: numberOfPlayers,
    saveId: 0,
    nobles: noblesDeck.nobles,
    blueDeck: blueDeck.cards,
    yellowDeck: yellowDeck.cards,
    greenDeck: greenDeck.cards,
    boardGems: {
      gold: 5,
      black: startingGems[numberOfPlayers],
      red: startingGems[numberOfPlayers],
      green: startingGems[numberOfPlayers],
      blue: startingGems[numberOfPlayers],
      white: startingGems[numberOfPlayers],
    },
    p1: p1Data,
    p2: p2Data,
    p3: p3Data,
    p4: p4Data,
  };

  xhr.responseType = "json";
  xhr.open("POST", "/api/db/newGame");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(body));

  gameLink = baseGameLink + "?game_id=" + gameId;
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      window.location = gameLink;
    }
  };
}
