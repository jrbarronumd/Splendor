import NoblesDeck from "./decks/noblesDeck.js";
import CardsDeck from "./decks/cardDeck.js";

var numberOfPlayers, gameData;
var myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");
var activePlayer = parseInt(myQueryString.get("p").slice(-1));
var gemOrder = ["gold", "white", "blue", "green", "red", "black"];

/* Probably not the most elegant way to do this, but the result is
   a 3 item array starting with the active player (determined by query string)*/
var playerOrder = [0, 1, 2, 3, 1, 2];
playerOrder = playerOrder.slice(activePlayer, activePlayer + 3);

var noblesDeck = new NoblesDeck();
var blueDeck = new CardsDeck();
var yellowDeck = new CardsDeck();
var greenDeck = new CardsDeck();

var gameBoardCards = document.getElementsByClassName("board-card");
var gameBoardGems = document.getElementsByClassName("gem-row");

for (var i = 0; i < 12; i++) {
  const button = gameBoardCards[i];
  button.addEventListener("click", boardCardClickHandler);
}

for (var i = 0; i < 6; i++) {
  const button = gameBoardGems[i];
  button.addEventListener("click", boardGemClickHandler);
}

getGameInfo();
function getGameInfo() {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("GET", `/api/db/getGame?game_id=${gameId}`);
  xhr.send();
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      gameData = xhr.response;
      numberOfPlayers = JSON.parse(gameData.players);
      dealNobles();
      dealGems();
      dealCards();
      setPlayers();
    }
  };
}

function dealNobles() {
  noblesDeck.nobles = JSON.parse(gameData.nobles);
  let noblesContainer = document.getElementsByClassName("nobles-row")[0];
  let newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[0].nobleId}.jpg" />`;
  noblesContainer.innerHTML = newDivContents;
  for (let i = 1; i < numberOfPlayers + 1; i++) {
    newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[i].nobleId}.jpg" />`;
    noblesContainer.innerHTML += newDivContents;
  }
  // Change width to match number of noble tiles
  for (let i = 0; i < numberOfPlayers + 1; i++) {
    const nobleImg = document.getElementsByClassName("nobles-row")[0].children[i];
    const maxWidth = 90 / (numberOfPlayers + 1);
    nobleImg.style.maxWidth = `${maxWidth}%`;
  }
}

function dealGems() {
  let boardGems = JSON.parse(gameData.board_gems);
  // using array items as JSON keys to pull gem values
  for (var i = 0; i < gemOrder.length; i++) {
    gameBoardGems[i].children[1].innerText = boardGems[gemOrder[i]];
  }
}

function dealCards() {
  blueDeck.cards = JSON.parse(gameData.blue_deck);
  yellowDeck.cards = JSON.parse(gameData.yellow_deck);
  greenDeck.cards = JSON.parse(gameData.green_deck);
  for (var i = 0; i < 4; i++) {
    document.getElementById(`board-blue-${i + 1}`).src = `images\\cards\\blue-${blueDeck.cards[i].cardId}.jpg`;
    document.getElementById(`board-yellow-${i + 1}`).src = `images\\cards\\yellow-${yellowDeck.cards[i].cardId}.jpg`;
    document.getElementById(`board-green-${i + 1}`).src = `images\\cards\\green-${greenDeck.cards[i].cardId}.jpg`;
  }
  deckCounter();
}

// Make note: player divs will be populated by turn order starting with the active player
function setPlayers() {
  // First delete the extra player divs (I think easier than starting with 2 in this scenario)
  for (var i = 4; i > numberOfPlayers; i--) {
    document.getElementsByClassName("player-container")[i - 1].remove();
  }
  // Re-Class divs and populate game data
  for (var i = 0; i < numberOfPlayers; i++) {
    let currentPlayerNum = playerOrder[i];
    let playerDiv = document.getElementsByClassName("player-container")[i];
    console.log(currentPlayerNum);
    let playerName = JSON.parse(gameData[`player_${currentPlayerNum}`]).name;
    playerDiv.getElementsByClassName("player-label")[0].innerText = playerName;
    var playerGems = JSON.parse(gameData[`player_${currentPlayerNum}`]).gems;
    var playerBonus = JSON.parse(gameData[`player_${currentPlayerNum}`]).bonus;
    console.log(playerGems);
    console.log(playerBonus);
    for (var j = 0; j < 5; j++) {
      //TODO: Should the number in parentheses be the total buying power?  Add description when mousing over?
      let gemContainer = playerDiv.getElementsByClassName("player-gems")[j];
      playerDiv.getElementsByClassName("player-gem-label")[j].innerText = playerGems[gemOrder[j + 1]]; //gold is first, so it is just skipped
      playerDiv.getElementsByClassName("player-gem-bonus")[j].innerText = `(${playerBonus[gemOrder[j + 1]]})`;
      gemContainer.addEventListener("click", playerGemClickHandler);
    }

    playerDiv.classList.replace(`player-${i + 1}`, `player-${currentPlayerNum}`);
  }
}

function deckCounter() {
  document.getElementsByClassName("deck-count")[0].innerText = blueDeck.cards.length - 4;
  document.getElementsByClassName("deck-count")[1].innerText = yellowDeck.cards.length - 4;
  document.getElementsByClassName("deck-count")[2].innerText = greenDeck.cards.length - 4;
}

function boardCardClickHandler() {
  console.log("Card clicked");
  // Make sure to keep the deck in order with the first 4 cards being the cards face up
  // if card #2 is chosen, card#5 in the deck should move to #2 (don't shift cards around on the board)
  // Need to write a cardDeck.js function to do that.
}

function boardGemClickHandler() {
  console.log("Gem clicked");
}

function playerGemClickHandler() {
  console.log("Player Gem clicked");
}
