import NoblesDeck from "./decks/noblesDeck.js";
import CardsDeck from "./decks/cardDeck.js";
import { rickRoll, randomRickRoll } from "./mischief.js";

// TODO: Implement a check to make sure the right number of players are connected via sockets(exactly 1 per player)?
// - ^Maybe just an alert when loading if there are 2 connections with same player?
// TODO: Add solo mode as option?  different logic to employ, probably?

var numberOfPlayers,
  gameData,
  gameInfo,
  resetData,
  resetState,
  previousPlayer,
  previousPosition,
  pData,
  boardGems,
  totalPlayerGems,
  p1Data,
  p2Data,
  p3Data,
  p4Data,
  round,
  timerId; // mischief
var takenGemColor = [];
var remainingGemColor = [];
var negativeGemColor = [];
let boardCardsArray = [];
let winnerArray = [];
let allPlayerScores = [0, 0, 0, 0]; // In turn order, player 1 first. Extra zeros should be no problem, but could be removed in initial load.
var allPlayers = {};
var playerOrder = [0, 1, 2, 3, 4, 1, 2, 3];
var myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");
var gameStatus = myQueryString.get("status") || "active";
if (!gameId || !myQueryString.get("p")) window.location = "index"; // Go to home page if no "gameID=" or "p=" in query string
var activePlayer = parseInt(myQueryString.get("p").slice(-1));
var inTurnPlayer = 0;
var gemOrder = ["gold", "white", "blue", "green", "red", "black"];
var actionIndex = 1; // 0 will stop any actions
var actionStarted = "none"; // Possibilities: none, gem, card, etc...
var nobleClaimed = 0; // Change to 1 on reservation to ensure only one per turn
var clickCounter = 0; // mischief
let winningScore;
let notifyWinner = true;
var logMessage = "";
let logRound = 1; // This line and the next will help keep track of how much of the log is rendered, so it won't create extra lines or duplicate work
let logTurn = 0;

var noblesDeck = new NoblesDeck();
var blueDeck = new CardsDeck();
var yellowDeck = new CardsDeck();
var greenDeck = new CardsDeck();
var blankDeck = new CardsDeck(); // Used when a deck runs out of cards
// var coinSound = new Audio("./sounds/coin.mp3");
// var bumpSound = new Audio("./sounds/bump.mp3");
// var deadSound = new Audio("./sounds/dead.wav");
// var jumpSound = new Audio("./sounds/jump.wav");
// var pingSound = new Audio("./sounds/ping.mp3");
// var smashSound = new Audio("./sounds/smash.mp3");

var cssRoot = document.querySelector(":root");
var mainPlayerContainer = document.getElementsByClassName("main-player-container")[0];
var boardGemContainer = document.getElementsByClassName("gems-column")[0];
var gameBoardCards = document.getElementsByClassName("card-container");
var gameBoardGems = boardGemContainer.getElementsByClassName("gem-container");
var gameBoardNobles = document.getElementsByClassName("nobles-row")[0];
var menuButton = document.getElementById("menu-button");
var resetTurnButton = document.getElementById("reset-turn");
var endTurnButton = document.getElementById("end-turn");
var buyReservedButton = document.getElementById("buy-reserved");
var claimNobleButton = document.getElementById("claim-noble");
var layoutRadio = document.getElementsByName("layout");
var magnifySlider = document.getElementById("magnify");
var menuCloseButton = document.getElementById("menu-close-button");
var magnifyResetButton = document.getElementById("menu-magnify-reset");
var notificationToggle = document.getElementById("notifications-toggle");
var audioToggle = document.getElementById("audio-toggle");
var cardMagToggle = document.getElementById("card-mag-toggle");
document.getElementById("reload-button").href = window.location; // Delete once not needed for development? Using this instead of refresh enables sounds to play immediately.
menuButton.addEventListener("click", menuOpen);
resetTurnButton.addEventListener("click", resetTurnHandler); // Should never be removed
document.getElementById("round-counter").addEventListener("click", roundClickHandler); // mischief

getFromStorage();
function getFromStorage() {
  const storedLayout = localStorage.getItem("layout");
  const storedAudio = localStorage.getItem("audio");
  const storedNotifications = localStorage.getItem("notifications");
  const storedMagSliderVal = localStorage.getItem("magSlider");
  const storedCardMag = localStorage.getItem("cardMag");
  if (storedLayout) {
    document.getElementById(storedLayout).checked = true;
  }
  if (storedAudio) {
    audioToggle.checked = JSON.parse(storedAudio);
  }
  if (storedNotifications) {
    notificationToggle.checked = JSON.parse(storedNotifications);
  }
  if (storedMagSliderVal) {
    magnifySlider.value = storedMagSliderVal;
  }
  if (storedCardMag) {
    cardMagToggle.checked = JSON.parse(storedCardMag);
  }
  resize();
}

window.onresize = resize;
function resize(event) {
  // Height and width calcs are based on margins/border/padding to determine remaining size for content.
  var heightMaxBlock, widthMaxBlock, blockSize;
  const gameTable = document.getElementById("game-table");
  const layout = document.querySelector('input[name="layout"]:checked').value;
  if (event?.target?.name == "layout") {
    // Reset magnification and store layout preference to local storage if triggered by a radio button
    magnifySlider.value = 1;
    localStorage.setItem("layout", layout);
  } else if (event?.target?.name == "magnify") {
    localStorage.setItem("magSlider", magnifySlider.value);
  }
  var magnification = magnifySlider.value;
  function gameBoardFull() {
    heightMaxBlock = (window.innerHeight * 0.98 - 69) / 5.386;
    widthMaxBlock = (window.innerWidth * 0.98 - 136) / 5.94;
    blockSize = Math.min(heightMaxBlock, widthMaxBlock); //The size in pixels of the width of one card
    blockSize = Math.max(blockSize, 75);
  }
  function sideBySide() {
    heightMaxBlock = (window.innerHeight * 0.98 - 69) / 5.386;
    widthMaxBlock = (window.innerWidth * 0.98 - 236) / 10.049;
    blockSize = Math.min(heightMaxBlock, widthMaxBlock);
  }
  if (layout == "side") {
    sideBySide();
    gameTable.style.flexWrap = "nowrap";
  } else if (layout == "full") {
    gameBoardFull();
    gameTable.style.flexWrap = "wrap";
  } else {
    // Layout = Auto
    gameTable.style.flexWrap = "wrap";
    const aspectRatio = window.innerWidth / window.innerHeight;
    if (aspectRatio > 1.3) {
      sideBySide();
    } else {
      gameBoardFull();
    }
  }
  var modifiedBlockSize = blockSize * magnification;
  cssRoot.style.setProperty("--block-size", `${modifiedBlockSize}px`);
}

// Set menu event listeners ////////////////////////////////////////////////////////
magnifySlider.addEventListener("input", resize);
notificationToggle.addEventListener("change", initiateNotifications);
cardMagToggle.addEventListener("change", magOnHover);
for (const radioButton of layoutRadio) {
  radioButton.addEventListener("change", resize);
}
audioToggle.addEventListener("change", () => {
  localStorage.setItem("audio", audioToggle.checked);
});

initiateNotifications();
function initiateNotifications(event) {
  if (event) {
    localStorage.setItem("notifications", notificationToggle.checked);
  }
  if (!notificationToggle.checked) {
    // Notifications not desired
    return;
  }
  if (!Notification) {
    alert("Desktop notifications not available in your browser. Try Chrome, Edge, or FireFox."); // If browser is not compatible this will occur
    return;
  }
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function notifyUser() {
  if (notificationToggle.checked) {
    new Notification("Time To Play!", { body: "It's your turn" });
  }
  // Audio (not notification) will not play until the user interacts with the domain. So if the user reloads the page, it won't play a sound until after a click event.
  if (audioToggle.checked) {
    var coinSound = new Audio("./sounds/coin.mp3");
    coinSound.play();
  }
}

function menuOpen() {
  removeEventListeners();
  menuButton.removeEventListener("click", menuOpen);
  document.getElementById("menu").style.display = "block";
  magnifyResetButton.addEventListener("click", resetMag);
  menuCloseButton.addEventListener("click", menuClose);
  menuButton.addEventListener("click", menuClose);
}
function menuClose() {
  menuButton.removeEventListener("click", menuClose);
  menuCloseButton.removeEventListener("click", menuClose);
  magnifyResetButton.removeEventListener("click", resetMag);
  document.getElementById("menu").style.display = "none";
  menuButton.addEventListener("click", menuOpen);
  resetEventListeners();
}
function resetMag() {
  magnifySlider.value = 1;
  localStorage.setItem("magSlider", magnifySlider.value);
  resize();
}
function magOnHover(event) {
  if (event) {
    localStorage.setItem("cardMag", cardMagToggle.checked);
  }
  if (cardMagToggle.checked) {
    for (const item of document.getElementsByClassName("player-details")) {
      item.classList.add("mag-on-hover");
    }
    for (const item of document.getElementsByClassName("player-noble")) {
      item.classList.add("mag-on-hover");
    }
  } else {
    removeClass(["mag-on-hover"]);
  }
}

function resetEventListeners() {
  endTurnButton.addEventListener("click", endTurnHandler);
  buyReservedButton.addEventListener("click", buyReservedHandler);
  claimNobleButton.addEventListener("click", claimNobleHandler);
  for (var i = 0; i < 12; i++) {
    const button = gameBoardCards[i].children[0];
    if (boardCardsArray[i].deck != "noDeck") {
      button.addEventListener("click", boardCardClickHandler);
    }
    button.removeEventListener("click", reserveCard);
  }
  for (var i = 0; i < 6; i++) {
    const button = gameBoardGems[i].getElementsByTagName("img")[0];
    button.addEventListener("click", boardGemClickHandler);
  }
  for (var i = 0; i < 5; i++) {
    const button = mainPlayerContainer.getElementsByClassName("gem-img")[i];
    button.addEventListener("click", playerGemClickHandler);
  }
  for (var i = 0; i < noblesDeck.nobles.length; i++) {
    const button = gameBoardNobles.children[i];
    button.removeEventListener("click", selectNoble);
  }
  for (var i = 0; i < pData.reserved_cards.length; i++) {
    const button = mainPlayerContainer.getElementsByClassName("reserved-card-container")[0].children[i];
    button.removeEventListener("click", selectReserved);
  }
  for (var i = 0; i < numberOfPlayers; i++) {
    // mischief
    document.getElementsByClassName("player-score")[i].addEventListener("click", playerScoreClickHandler);
  }
}
function removeEventListeners() {
  endTurnButton.removeEventListener("click", endTurnHandler);
  buyReservedButton.removeEventListener("click", buyReservedHandler);
  claimNobleButton.removeEventListener("click", claimNobleHandler);
  for (var i = 0; i < 12; i++) {
    const button = gameBoardCards[i].children[0];
    button.removeEventListener("click", reserveCard);
    button.removeEventListener("click", boardCardClickHandler);
  }
  for (var i = 0; i < 6; i++) {
    const button = gameBoardGems[i].getElementsByTagName("img")[0];
    button.removeEventListener("click", boardGemClickHandler);
  }
  for (var i = 0; i < 5; i++) {
    const button = mainPlayerContainer.getElementsByClassName("gem-img")[i];
    button.removeEventListener("click", playerGemClickHandler);
  }
  for (var i = 0; i < numberOfPlayers; i++) {
    // mischief
    document.getElementsByClassName("player-score")[i].removeEventListener("click", playerScoreClickHandler);
  }
}

const socket = io({
  reconnectionDelay: 5000,
  reconnectionAttempts: 3,
});

// As soon as connection is made, join user to the game's socket room, which will initiate game data push
socket.on("connect", () => {
  socket.emit("game-load", gameId, activePlayer, gameStatus);
});

// When connection is confirmed by server, log socket ID to console
socket.on("connected", (result) => {
  console.log(result);
});

// Server pushed gameData after connection.  This is the initial game-load ONLY.
socket.once("game-data", (respData) => {
  resetState = "initial"; // Will change to "update" after any new data is pushed.
  // redirect to home page if invalid game ID
  if (!respData) {
    console.log("invalid game ID");
    alert("Invalid game ID");
    window.location = "index";
    return;
  }
  resetData = respData;
  initialLoad(respData);
  dealNobles();
  dealGems();
  dealCards();
  setTable();
  updateLog("reload");
  document.getElementById("game-log-start").innerText = `Start of Game - Winning Score: ${winningScore}`;
  if (inTurnPlayer == activePlayer && gameStatus == "active") {
    startActionItems();
    notifyUser();
    document.getElementsByClassName("action-buttons")[0].classList.remove("invisible");
  } else {
    document.getElementsByClassName("action-buttons")[0].classList.add("invisible");
  }
  // If game is over, kill event listeners and action items
  if (inTurnPlayer == 1 && gameInfo.winner.length > 0) {
    resetTurnButton.removeEventListener("click", resetTurnHandler);
    removeEventListeners();
    stopActionItems();
  }
});

function initialLoad(data) {
  gameData = data;
  numberOfPlayers = JSON.parse(gameData.players);
  pData = JSON.parse(gameData[`player_${activePlayer}`]);
  boardGems = JSON.parse(gameData.board_gems);
  inTurnPlayer = parseInt(gameData.save_id.toString().slice(-1));
  gameInfo = JSON.parse(gameData.game_info);
  noblesDeck.nobles = JSON.parse(gameData.nobles);
  blueDeck.cards = JSON.parse(gameData.blue_deck);
  yellowDeck.cards = JSON.parse(gameData.yellow_deck);
  greenDeck.cards = JSON.parse(gameData.green_deck);
  p1Data = JSON.parse(gameData.player_1);
  p2Data = JSON.parse(gameData.player_2);
  p3Data = JSON.parse(gameData.player_3);
  p4Data = JSON.parse(gameData.player_4);
  allPlayers = { p1Data, p2Data, p3Data, p4Data };
  winningScore = parseInt(gameInfo.winning_score) || 15;
}

// This will be executed every time another player finishes a turn
socket.on("new-row-result", (newData) => {
  let previousWinners = winnerArray; // To handle sound for change in winner status
  resetState = "update";
  previousPlayer = inTurnPlayer;
  previousPosition = playerOrder.indexOf(previousPlayer);
  newRowUpdate(newData);
  // If game is over, go to game over page
  if (inTurnPlayer == 1 && gameInfo.winner.length > 0) {
    let gameLink = "game-over" + "?game_id=" + gameId + "&p=p" + activePlayer;
    let mischiefLevel = gameInfo.mischief;
    if (mischiefLevel) gameLink += "&m=" + mischiefLevel;
    setTimeout(function () {
      window.location = gameLink;
    }, 5000);
    document.getElementById("turn-marker").innerText = "Game Over";
    alert("The game is over.  You will now be redirected to the game summary");
  }
  document.getElementById("turn-marker").innerText = `${gameData[`player_${inTurnPlayer}`].name}'s Turn`;
  document.getElementById("round-counter").innerText = `Round: ${round}`;
  // Clear outlined player container, and move to next player
  document.getElementById("in-turn-player").removeAttribute("id");
  let playerDiv = document.getElementsByClassName("player-container")[playerOrder.indexOf(inTurnPlayer)];
  playerDiv.id = "in-turn-player";
  dealNobles();
  dealGems();
  dealCards();
  updatePlayer(previousPlayer, previousPosition);
  updateLog("update");
  checkForWinner();
  updateFavicon();
  if (inTurnPlayer == activePlayer) {
    startActionItems();
    notifyUser();
    document.getElementsByClassName("action-buttons")[0].classList.remove("invisible");
    gameInfo[`p${activePlayer}Turn`] = {};
  } else {
    document.getElementsByClassName("action-buttons")[0].classList.add("invisible");
  }
  if ((previousWinners[0] != winnerArray[0] || previousWinners.length != winnerArray.length) && audioToggle.checked) {
    var deadSound = new Audio("./sounds/dead.wav");
    setTimeout(function () {
      deadSound.play();
    }, 700);
  }
});

function newRowUpdate(data) {
  resetData = JSON.parse(JSON.stringify(data)); // To create a copy of the data to be used for reset
  gameData = data;
  round = parseInt(gameData.save_id.toString().slice(0, -2));
  pData = gameData[`player_${activePlayer}`];
  boardGems = gameData.board_gems;
  inTurnPlayer = parseInt(gameData.save_id.toString().slice(-1));
  gameInfo = gameData.game_info;
  noblesDeck.nobles = gameData.nobles;
  blueDeck.cards = gameData.blue_deck;
  yellowDeck.cards = gameData.yellow_deck;
  greenDeck.cards = gameData.green_deck;
  p1Data = gameData.player_1;
  p2Data = gameData.player_2;
  p3Data = gameData.player_3;
  p4Data = gameData.player_4;
  allPlayers = { p1Data, p2Data, p3Data, p4Data };
}

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected: " + reason);
});

function dealNobles() {
  // Recreate the nobles row 1 img at a time (over-writing the HTML for the whole div)
  let noblesLeft = noblesDeck.nobles.length;
  if (noblesLeft == 0) {
    let newDivContents = "";
    gameBoardNobles.innerHTML = newDivContents;
    return;
  }
  let newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[0].nobleId}.jpg" />`;
  gameBoardNobles.innerHTML = newDivContents;
  for (let i = 1; i < noblesLeft; i++) {
    newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[i].nobleId}.jpg" />`;
    gameBoardNobles.innerHTML += newDivContents;
  }
}

function dealGems() {
  // using array items as JSON keys to pull gem values
  for (var i = 0; i < gemOrder.length; i++) {
    gameBoardGems[i].getElementsByTagName("span")[0].innerText = boardGems[gemOrder[i]];
  }
}

function dealCards() {
  boardCardsArray = [blueDeck.cards.slice(0, 4), yellowDeck.cards.slice(0, 4), greenDeck.cards.slice(0, 4)].flat();
  for (var i = 0; i < 12; i++) {
    let imgElement = gameBoardCards[i].getElementsByTagName("img")[0];
    // If a deck is out of cards, deal a face-down green card, then hide it
    if (boardCardsArray[i].deck == "noDeck") {
      imgElement.src = `images/cards/green-${boardCardsArray[i].cardId}.jpg`;
      imgElement.parentElement.classList.add("invisible");
    } else {
      imgElement.src = `images/cards/${boardCardsArray[i].deck}-${boardCardsArray[i].cardId}.jpg`;
    }
  }
  deckCounter();
}

// Anything that should only run once upon loading the page should go here.
function setTable() {
  playerOrder = playerOrder.filter((x) => x <= numberOfPlayers); // remove any numbers higher than numberOfPlayers
  playerOrder = playerOrder.slice(activePlayer, activePlayer + numberOfPlayers);
  document.getElementsByClassName("player-container")[playerOrder.indexOf(inTurnPlayer)].id = "in-turn-player";
  let turnMarkerText = " ";
  if (gameStatus == "active") {
    turnMarkerText = `${JSON.parse(gameData[`player_${inTurnPlayer}`]).name}'s Turn`;
  } else if (gameStatus == "finished") {
    turnMarkerText = "Game Over!";
  }
  document.getElementById("turn-marker").innerText = turnMarkerText;
  round = parseInt(gameData.save_id.toString().slice(0, -2));
  document.getElementById("round-counter").innerText = `Round: ${round}`;
  // First delete the extra player divs (I think easier than starting with 2)
  for (var i = 4; i > numberOfPlayers; i--) {
    document.getElementsByClassName("player-container")[i - 1].remove();
  }
  // Player divs will be populated by turn order starting with the active player at the top
  for (var i = 0; i < numberOfPlayers; i++) {
    let currentPlayerNum = playerOrder[i];
    // Next 3 lines are required to update player scores BEFORE the delay function executes update player
    let playerData = allPlayers[`p${currentPlayerNum}Data`];
    let playerScore = playerData.points;
    allPlayerScores[currentPlayerNum - 1] = playerScore;
    delayTasks(currentPlayerNum, i);
    let playerDiv = document.getElementsByClassName("player-container")[i];
    playerDiv.classList.replace(`player-${i + 1}`, `player-${playerOrder[i]}`);
  }
  console.log(`Active Player: ${pData.name}`);
  checkForWinner();
  // If game is over, create link to game over page (don't force user to that page in initial load). This is the only way to stay on the page if game is over.
  if (inTurnPlayer == 1 && winnerArray.length > 0) {
    let gameLink = "game-over" + "?game_id=" + gameId + "&p=p" + activePlayer;
    let mischiefLevel = gameInfo.mischief;
    if (mischiefLevel) gameLink += "&m=" + mischiefLevel;
    let navContainer = document.getElementsByClassName("nav")[0];
    navContainer.innerHTML += `<a href=${gameLink}>Game Over</a>`;
  }
}

// Add delay to player update so hopefully there won't be errors in the server when there are a lot of cards for each player.
function delayTasks(currentPlayerNum, i) {
  setTimeout(function () {
    updatePlayer(currentPlayerNum, i);
  }, 200 * (i + 1));
  // The rest only needs to run once
  if (i == numberOfPlayers - 1) {
    setTimeout(function () {
      resetEventListeners();
      magOnHover();
      updateFavicon();
    }, 1000);
  }
}

function updatePlayer(player, playerPosition) {
  let playerDiv = document.getElementsByClassName("player-container")[playerPosition];
  let playerData = allPlayers[`p${player}Data`];
  let playerName = playerData.name;
  playerDiv.getElementsByClassName("player-name")[0].innerText = playerName;
  let playerScore = playerData.points;
  playerDiv.getElementsByClassName("player-score")[0].innerText = `Score: ${playerScore}`;
  allPlayerScores[player - 1] = playerScore;
  let nobleContainer = playerDiv.getElementsByClassName("player-noble")[0];
  let playerNobles = playerData.nobles;
  let playerGems = playerData.gems;
  let playerBonus = playerData.bonus;
  let playerGoldCount = playerGems.gold;
  let goldGemContainer = playerDiv.getElementsByClassName("player-gold-gem")[0];
  // Add nobles if necessary
  let existingNobles = nobleContainer.getElementsByTagName("img").length;
  for (let j = existingNobles; j < playerNobles.length; j++) {
    let newDivContents = `<img src="images/nobles/nobles-${playerNobles[j].nobleId}.jpg" />`;
    nobleContainer.innerHTML += newDivContents;
  }
  // Add gold gem images if necessary
  let newGolds = playerGoldCount - goldGemContainer.getElementsByTagName("img").length;
  for (let j = 0; j < newGolds; j++) {
    let newDivContents = `<img src="images/gems/goldGem.jpg" />`;
    goldGemContainer.innerHTML += newDivContents;
  }
  // Remove Gold gems if necessary
  for (let j = newGolds; j < 0; j++) {
    goldGemContainer.firstElementChild.remove();
  }
  // Populate player gems/bonus counts
  for (let j = 1; j <= 5; j++) {
    playerDiv.getElementsByClassName("player-gem-count")[j - 1].innerText = playerGems[gemOrder[j]]; //gold is first, so it is just skipped
    playerDiv.getElementsByClassName("player-bonus")[j - 1].innerText = `(${playerBonus[gemOrder[j]]})`;
    playerDiv.getElementsByClassName("player-total")[j - 1].innerText = playerGems[gemOrder[j]] + playerBonus[gemOrder[j]];
  }
  // Populate reserved/purchased cards if present
  let dropDownContainer = playerDiv.getElementsByClassName("player-drop-down")[0];
  let reservedCards = playerData.reserved_cards;
  let reserveCount = reservedCards.length;
  if (reserveCount > 0) {
    let reserveContainer = playerDiv.getElementsByClassName("reserved-card-container")[0];
    let existingReserved = 0;
    if (reserveContainer) {
      existingReserved = reserveContainer.getElementsByTagName("img").length;
    } else {
      // Create Dropdown if not exists
      let newElement = document.createElement("details");
      newElement.classList.add("player-details");
      newElement.setAttribute("open", true);
      let newElementContents = `
        <summary>Reserved Cards (${reserveCount})</summary>
        <div class="reserved-card-container">
        </div>`;
      newElement.innerHTML = newElementContents;
      dropDownContainer.insertBefore(newElement, dropDownContainer.firstChild);
    }
    reserveContainer = playerDiv.getElementsByClassName("reserved-card-container")[0];
    reserveContainer.parentElement.getElementsByTagName("summary")[0].innerText = `Reserved Cards (${reserveCount})`;

    // If adding cards to dropdown
    if (reserveCount > existingReserved) {
      for (let j = existingReserved; j < reserveCount; j++) {
        reserveContainer.innerHTML += `<img src="images/cards/${reservedCards[j].deck}-${reservedCards[j].cardId}.jpg" />`;
      }
    } // If removing card from dropdown
    else if (reserveCount < existingReserved) {
      for (let j = existingReserved - 1; j >= 0; j--) {
        // Delete img if img ID doesn't match any reserved card
        let imgId = reserveContainer.getElementsByTagName("img")[j].src.slice(-6, -4);
        let idFound = 0;
        playerData.reserved_cards.forEach((card) => {
          if (card.cardId == imgId) {
            idFound = 1;
          }
        });
        if (idFound == 0) {
          reserveContainer.getElementsByTagName("img")[j].remove();
        }
      }
    }
  } else {
    // This will run if a player just bought their last reserved card
    let reserveContainer = playerDiv.getElementsByClassName("reserved-card-container")[0];
    if (reserveContainer) {
      reserveContainer.parentElement.remove();
    }
  }

  let purchasedCards = playerData.purchased_cards;
  let purchaseCount = purchasedCards.length;
  if (purchaseCount > 0) {
    let purchaseContainer = dropDownContainer.getElementsByClassName("purchased-card-container")[0];
    let existingPurchased = 0;
    if (purchaseContainer) {
      existingPurchased = purchaseContainer.getElementsByTagName("img").length;
    } else {
      let newElement = document.createElement("details");
      newElement.classList.add("player-details");
      let newElementContents = `
      <summary>Purchased Cards (${purchaseCount})</summary>
      <div class="purchased-card-container">
      </div>`;
      newElement.innerHTML = newElementContents;
      dropDownContainer.append(newElement);
    }
    purchaseContainer = playerDiv.getElementsByClassName("purchased-card-container")[0];
    purchaseContainer.parentElement.getElementsByTagName("summary")[0].innerText = `Purchased Cards (${purchaseCount})`;
    for (let j = existingPurchased; j < purchaseCount; j++) {
      purchaseContainer.innerHTML += `<img src="images/cards/${purchasedCards[j].deck}-${purchasedCards[j].cardId}.jpg" />`;
    }
  }
  highlightActions(player);
  if (player == activePlayer) {
    gameInfo[`p${activePlayer}Turn`] = {};
  }
}

function deckCounter() {
  document.getElementsByClassName("deck-counter")[0].innerText = `(${blueDeck.cards.length - 4})`;
  document.getElementsByClassName("deck-counter")[1].innerText = `(${yellowDeck.cards.length - 4})`;
  document.getElementsByClassName("deck-counter")[2].innerText = `(${greenDeck.cards.length - 4})`;
}

function boardCardClickHandler(event) {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  // Check to see if player is selected for harassment.
  if (gameInfo.selectedPlayers?.[activePlayer]) {
    let randomMischief = randomRickRoll(gameInfo.selectedPlayers[activePlayer]);
    // If RickRolled, abort click action
    if (randomMischief) return;
  }
  if (actionIndex == 0) {
    alert(`You have already completed your turn. Please click "End Turn" or "Reset Turn" button`);
    return;
  }
  if (actionStarted != "none") {
    alert(
      `You have already started completing a "${actionStarted}" action. Please complete that action and end your turn, or click "Reset Turn" button`
    );
    return;
  }
  let purchasedCard, newCard, activeDeck;
  let deckIndex = event.target.id.slice(-1) - 1; // Position of the card in the deck - NOT the card ID
  let deckColor = event.target.id.slice(6, -2);
  if (deckColor == "blue") {
    activeDeck = blueDeck;
  }
  if (deckColor == "yellow") {
    activeDeck = yellowDeck;
  }
  if (deckColor == "green") {
    activeDeck = greenDeck;
  }
  purchasedCard = activeDeck.cards[deckIndex];
  if (purchasedCard.deck == "noDeck") {
    alert("Don't click that. Also - Contact the developer to tell him he sucks"); // Shouldn't be an event listener, but just in case...
    return;
  }
  let validate = buyCard(purchasedCard);
  if (validate == 0) {
    return; // Can't afford card. No alert message.
  }
  // Handle when deck runs out of cards
  if (activeDeck.cards.length < 5) {
    newCard = blankDeck.cards[0];
    event.target.parentElement.classList.add("invisible");
  } else {
    newCard = activeDeck.cards[4];
    activeDeck.cards.splice(4, 1); // Remove next card from deck, so it can be placed in the hole left by the purchased card
  }
  activeDeck.cards.splice(deckIndex, 1, newCard);
  event.target.src = `images/cards/${deckColor}-00.jpg`; // Replace purchased card with face-down card
  // event.target.src = `images/cards/${deckColor}-${newCard.cardId}.jpg`; // For Troubleshooting only!
  // Add the gained color bonus to the table and pData
  gameInfo[`p${activePlayer}Turn`].purchasedCard = { deck: deckColor, position: deckIndex };
  logMessage = ` purchased a card from the ${purchasedCard.deck} deck and gained 1 ${purchasedCard.color} bonus and ${purchasedCard.points} point(s)`;
  actionStarted = "card";
  actionIndex = 0;
  stopActionItems();
  deckCounter();
}

function buyCard(purchasedCard) {
  // Handle a card purchase from the board or player reserved cards
  // Validate purchase
  let surplus = pData.gems.gold;
  for (let i = 1; i <= 5; i++) {
    let purchasePower = pData.gems[gemOrder[i]] + pData.bonus[gemOrder[i]];
    surplus += Math.min(0, purchasePower - purchasedCard[gemOrder[i]]);
    // Remaining surplus is remaining gold. Negative number means the player can't afford it.
    if (surplus < 0) {
      return 0;
    }
  }
  // Pay for card, and add spent gems to board
  for (let i = 1; i <= 5; i++) {
    let cost = Math.max(0, purchasedCard[gemOrder[i]] - pData.bonus[gemOrder[i]]); // max function will handle if bonus is greater than total cost of a color
    cost = Math.min(cost, pData.gems[gemOrder[i]]); // This will catch if golds are needed, so player gems don't go negative
    pData.gems[gemOrder[i]] -= cost;
    boardGems[gemOrder[i]] += cost;
    mainPlayerContainer.getElementsByClassName("player-gem-count")[i - 1].innerText = pData.gems[gemOrder[i]];
    mainPlayerContainer.getElementsByClassName("player-total")[i - 1].innerText = pData.gems[gemOrder[i]] + pData.bonus[gemOrder[i]];
  }
  // Resolve any spent gold gems in pData and on game table
  for (var i = surplus; i < pData.gems.gold; i++) {
    mainPlayerContainer.getElementsByClassName("player-gold-gem")[0].firstElementChild.remove();
    boardGems.gold += 1;
  }
  pData.gems.gold = surplus;
  dealGems(); // For board gem display
  // Create dropdown if not present (relying on fact that if there are purchased cards, it was already created)
  let dropDownContainer = mainPlayerContainer.getElementsByClassName("player-drop-down")[0];
  if (pData.purchased_cards.length == 0) {
    let newElement = document.createElement("details");
    newElement.classList.add("player-details");
    let newElementContents = `
      <summary>Purchased Cards (1)</summary>
      <div class="purchased-card-container">
      </div>`;
    newElement.innerHTML = newElementContents;
    dropDownContainer.append(newElement);
  }
  let purchaseContainer = mainPlayerContainer.getElementsByClassName("purchased-card-container")[0];
  let deckColor = purchasedCard.deck;
  purchaseContainer.innerHTML += `<img src="images/cards/${deckColor}-${purchasedCard.cardId}.jpg" />`;
  pData.purchased_cards.push(purchasedCard); // Add card to player's purchased cards
  pData.points += purchasedCard.points;
  purchaseContainer.parentElement.getElementsByTagName("summary")[0].innerText = `Purchased Cards (${pData.purchased_cards.length})`;
  let playerScoreContainer = mainPlayerContainer.getElementsByClassName("player-score")[0];
  playerScoreContainer.innerText = `Score: ${pData.points}`;
  allPlayerScores[activePlayer - 1] = pData.points;
  checkForWinner();
  pData.bonus[purchasedCard.color] += 1;
  // Update total purchasing power for the color of the purchased card
  let totalGemContainer = mainPlayerContainer.getElementsByClassName("player-total")[gemOrder.indexOf(purchasedCard.color) - 1];
  totalGemContainer.innerText = pData.gems[purchasedCard.color] + pData.bonus[purchasedCard.color];
  let bonusGemContainer = mainPlayerContainer.getElementsByClassName("player-gem-container")[gemOrder.indexOf(purchasedCard.color) - 1];
  bonusGemContainer.getElementsByClassName("player-bonus")[0].innerText = `(${pData.bonus[purchasedCard.color]})`;
}

function gemCheck() {
  // Emphasize gem counts if exceeding 10 total
  totalPlayerGems = 0;
  for (var i in pData.gems) {
    totalPlayerGems += pData.gems[i];
  }
  if (totalPlayerGems > 10) {
    mainPlayerContainer.getElementsByClassName("main-player-gem-row")[0].classList.add("over-ten");
  } else {
    mainPlayerContainer.getElementsByClassName("main-player-gem-row")[0].classList.remove("over-ten");
  }
  // Redefine remaining gem color array (this is only for knowing when a player can end a turn without taking a full turn worth of gems)
  remainingGemColor = [];
  for (var i = 1; i < 6; i++) {
    let color = gemOrder[i];
    let boardCount = boardGems[color];
    if (boardCount != 0 && takenGemColor.indexOf(color) == -1) {
      remainingGemColor.push(color);
    }
  }
}

function boardGemClickHandler(event) {
  if (activePlayer != inTurnPlayer) return;
  // Check to see if player is selected for harassment.
  if (gameInfo.selectedPlayers?.[activePlayer]) {
    let randomMischief = randomRickRoll(gameInfo.selectedPlayers[activePlayer]);
    // If RickRolled, abort click action
    if (randomMischief) return;
  }
  if (actionStarted != "none" && actionStarted != "gem") {
    alert(
      `You have already started completing a "${actionStarted}" action. Please complete that action and end your turn, or click "Reset Turn" button`
    );
    return;
  }
  if (actionIndex == 0) {
    alert(`You have already completed your turn. Please click "End Turn" or "Reset Turn" button`);
    return;
  }
  let clickedContainer = event.target.parentElement;
  let gemIndex = Array.prototype.indexOf.call(clickedContainer.parentElement.children, clickedContainer);
  let boardCountContainer = clickedContainer.getElementsByClassName("board-gem-count")[0];
  let boardCount = parseInt(boardCountContainer.innerText);
  let gemColor = gemOrder[gemIndex];
  if (gemIndex == 0) {
    goldGemHandler();
    stopActionItems();
    return;
  }
  if (boardCount == 0) {
    alert(`There are no ${gemColor} gems left`);
    return;
  }
  let duplicate = takenGemColor.indexOf(gemColor) >= 0; // Boolean value
  if (duplicate) {
    // If the clicked color has already been clicked in this turn
    if (takenGemColor.length > 1) {
      alert("You've already taken 2 gems. You can't take a duplicate at this time.");
      return;
    } else if (boardCount < 3) {
      alert("You cannot take 2 gems of the same color unless there were 4 in stack at the start of your turn.");
      return;
    } // This is where things actually start to happen...
    else if (takenGemColor.length == 1) {
      actionIndex = 0; // If legally taking 2 of 1 color, disable further actions
    }
  }
  let playerCountContainer = mainPlayerContainer.getElementsByClassName("player-gem-count")[gemIndex - 1];
  let negativeReturn = negativeGemColor.indexOf(gemColor);
  // If player takes a gem that they previously returned this turn
  if (negativeReturn >= 0) {
    negativeGemColor.splice(negativeReturn, 1);
    let duplicateNegativeReturn = negativeGemColor.indexOf(gemColor);
    if (duplicateNegativeReturn < 0) {
      playerCountContainer.parentElement.classList.remove("negative-gem");
    }
  } else {
    takenGemColor.push(gemColor);
    clickedContainer.classList.add("acted-on");
    playerCountContainer.parentElement.classList.add("acted-on");
  }
  boardGems[gemColor] -= 1;
  boardCountContainer.innerText -= 1;
  let playerGemCount = parseInt(playerCountContainer.innerText);
  pData.gems[gemColor] += 1;
  playerGemCount += 1;
  playerCountContainer.innerText = playerGemCount;
  playerCountContainer.parentElement.getElementsByClassName("player-total")[0].innerText = playerGemCount + pData.bonus[gemColor];
  playerCountContainer;
  if (takenGemColor.length == 3) {
    actionIndex = 0; // Turn complete
  }
  actionStarted = "gem";
  gameInfo[`p${activePlayer}Turn`].gems = takenGemColor;
  startActionItems();
  gemCheck();
}

function goldGemHandler() {
  if (takenGemColor.length > 0) {
    alert("You've already taken at least one gem this turn. Return it by clicking that gem color in your stack");
    return;
  }
  let boardGemContainer = document.getElementsByClassName("gem-container")[0];
  let playerGemContainer = document.getElementsByClassName("player-gold-gem")[0];
  let boardGemCount = parseInt(boardGemContainer.getElementsByClassName("board-gem-count")[0].innerText);
  let dropDownContainer = mainPlayerContainer.getElementsByClassName("player-drop-down")[0];
  let reserveContainer = mainPlayerContainer.getElementsByClassName("reserved-card-container")[0];
  let reserveCount = pData.reserved_cards.length;
  if (reserveCount == 3) {
    alert("You may not reserve more than 3 cards at a time");
    return;
  }
  actionStarted = "gem";
  // Add reserved card dropdown container if not present
  if (!reserveContainer) {
    let newElement = document.createElement("details");
    newElement.classList.add("player-details");
    newElement.setAttribute("open", true);
    let newElementContents = `
    <summary>Reserved Cards (1)</summary>
    <div class="reserved-card-container">
    </div>`;
    newElement.innerHTML = newElementContents;
    dropDownContainer.insertBefore(newElement, dropDownContainer.firstChild);
  }
  // Claim a gem if available to claim
  if (boardGemCount > 0) {
    boardGems.gold -= 1;
    boardGemCount -= 1;
    boardGemContainer.getElementsByClassName("board-gem-count")[0].innerText = boardGemCount;
    let newDivContents = `<img src="images/gems/goldGem.jpg" />`;
    playerGemContainer.innerHTML += newDivContents;
    pData.gems.gold += 1;
    logMessage = ` took a gold gem -`;
  }
  removeEventListeners();
  for (var i = 0; i < 12; i++) {
    const button = gameBoardCards[i].children[0];
    if (boardCardsArray[i].deck != "noDeck") {
      button.addEventListener("click", reserveCard);
    }
  }
  document.getElementById("player-notice").innerText = "Select a card to reserve";
  document.getElementsByClassName("nobles-row")[0].classList.add("ignore-me");
  document.getElementsByClassName("gems-column")[0].classList.add("ignore-me");
  document.getElementsByClassName("main-player-gem-row")[0].classList.add("ignore-me");
  document.getElementsByClassName("player-drop-down")[0].classList.add("ignore-me");
  for (var i = 1; i < 4; i++) {
    document.getElementsByClassName("action-buttons")[0].children[i].classList.add("ignore-me");
  }
  for (var i = 1; i < numberOfPlayers; i++) {
    document.getElementsByClassName("player-container")[i].classList.add("ignore-me");
  }
  for (var i = 0; i < 12; i++) {
    document.getElementsByClassName("card-container")[i].classList.add("emphasize");
  }
}

function reserveCard(event) {
  let reservedCard, newCard, activeDeck;
  let reserveContainer = mainPlayerContainer.getElementsByClassName("reserved-card-container")[0];
  let deckIndex = event.target.id.slice(-1) - 1; // Position of the card in the deck - NOT the card ID
  let deckColor = event.target.id.slice(6, -2);
  actionStarted = "reserve";
  if (deckColor == "blue") {
    activeDeck = blueDeck;
  }
  if (deckColor == "yellow") {
    activeDeck = yellowDeck;
  }
  if (deckColor == "green") {
    activeDeck = greenDeck;
  }
  reservedCard = activeDeck.cards[deckIndex];
  newCard = activeDeck.cards[4]; // Remove next card from deck, so it can be placed in the hole left by the reserved card
  activeDeck.cards.splice(4, 1);
  activeDeck.cards.splice(deckIndex, 1, newCard);
  pData.reserved_cards.push(reservedCard); // Add card to player's reserved cards
  gameInfo[`p${activePlayer}Turn`].reservedCard = { deck: deckColor, position: deckIndex };
  reserveContainer.parentElement.getElementsByTagName("summary")[0].innerText = `Reserved Cards (${pData.reserved_cards.length})`;
  reserveContainer.innerHTML += `<img src="images/cards/${deckColor}-${reservedCard.cardId}.jpg" />`;
  event.target.src = `images/cards/${deckColor}-00.jpg`; // Replace reserved card with face-down card
  // event.target.src = `images/cards/${deckColor}-${newCard.cardId}.jpg`; // For Troubleshooting only!
  actionIndex = 0; // Disable further actions after reserving is complete
  logMessage += ` reserved a card from the ${deckColor} deck`;
  document.getElementById("player-notice").innerText = "";
  removeClass(["ignore-me", "emphasize"]);
  startActionItems();
  gemCheck();
  deckCounter();
  resetEventListeners();
}

function playerGemClickHandler(event) {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (actionStarted != "gem" && actionStarted != "reserve") {
    alert(`You may only return gems if you have already taken a gem this turn. Take the gems you want, and return at the end of your turn`);
    return;
  }
  let clickedContainer = event.target.parentElement;
  let gemIndex = Array.prototype.indexOf.call(clickedContainer.parentElement.children, clickedContainer);
  let gemColor = gemOrder[gemIndex];
  let playerCountContainer = clickedContainer.getElementsByClassName("player-gem-count")[0];
  let playerCount = parseInt(playerCountContainer.innerText);
  let boardCountContainer = boardGemContainer.getElementsByClassName("board-gem-count")[gemIndex];
  let boardCount = parseInt(boardCountContainer.innerText);
  if (playerCount == 0) {
    // No alert necessary if the player has no gems to return
    return;
  }
  let gemReturn = takenGemColor.indexOf(gemColor); // Will return -1 if gem color was not taken this turn
  if (gemReturn >= 0) {
    // If gem being returned is one that was taken this turn, another gem can be taken (remove from takenGemColor)
    takenGemColor.splice(gemReturn, 1);
    let duplicateReturn = takenGemColor.indexOf(gemColor);
    if (duplicateReturn < 0) {
      // Leave gems highlighted if returning 1 of duplicate gem (still one taken)
      clickedContainer.classList.remove("acted-on");
      gameBoardGems[gemIndex].classList.remove("acted-on");
    }
    actionIndex = 1;
    if (takenGemColor.length == 0) {
      // Don't let the player end turn if the net gem take was nothing
      actionStarted = "none";
    }
  } else {
    negativeGemColor.push(gemColor);
    clickedContainer.classList.add("negative-gem");
  }
  pData.gems[gemColor] -= 1;
  playerCountContainer.innerText -= 1;
  playerCountContainer.parentElement.getElementsByClassName("player-total")[0].innerText = pData.gems[gemColor] + pData.bonus[gemColor];
  boardGems[gemColor] += 1;
  boardCountContainer.innerText = boardCount + 1;
  startActionItems();
  gemCheck();
}

function buyReservedHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (actionIndex == 0) {
    alert(`You have already completed your turn. Please click "End Turn" or "Reset Turn" button`);
    return;
  }
  if (actionStarted != "none") {
    alert(
      `You have already started completing a "${actionStarted}" action. Please complete that action and end your turn, or click "Reset Turn" button`
    );
    return;
  }
  if (pData.reserved_cards.length == 0) {
    alert(`You don't have any cards reserved, numbskull! Do something legal!`);
    return;
  }
  // Make obvious where the player must click by dimming everywhere else
  document.getElementById("game-board").classList.add("ignore-me");
  for (var i = 1; i < numberOfPlayers; i++) {
    document.getElementsByClassName("player-container")[i].classList.add("ignore-me");
  }
  for (var i = 1; i < 4; i++) {
    document.getElementsByClassName("action-buttons")[0].children[i].classList.add("ignore-me");
  }
  document.getElementsByClassName("main-player-gem-row")[0].classList.add("ignore-me");
  document.getElementsByClassName("reserved-card-container")[0].classList.add("embiggen");
  console.log("Buying reserved card");
  removeEventListeners();
  for (var i = 0; i < pData.reserved_cards.length; i++) {
    const button = mainPlayerContainer.getElementsByClassName("reserved-card-container")[0].children[i];
    button.addEventListener("click", selectReserved);
  }
}

function selectReserved(event) {
  let clickedCardImg = event.target;
  let reservedIndex = Array.prototype.indexOf.call(clickedCardImg.parentElement.children, clickedCardImg);
  let clickedCard = pData.reserved_cards[reservedIndex];
  let validate = buyCard(clickedCard);
  let reserveContainer = mainPlayerContainer.getElementsByClassName("reserved-card-container")[0];
  if (validate == 0) {
    alert("Nope");
    return; // Can't afford card.
  }
  // Un-dim everything BEFORE the reserved card dropdown changes or is removed.
  removeClass(["ignore-me", "embiggen"]);
  pData.reserved_cards.splice(reservedIndex, 1); // Remove card from player's reserved cards
  event.target.remove();
  reserveContainer.parentElement.getElementsByTagName("summary")[0].innerText = `Reserved Cards (${pData.reserved_cards.length})`;
  if (pData.reserved_cards.length == 0) {
    // Remove the whole dropdown if not needed anymore
    reserveContainer.parentElement.remove();
  }
  gameInfo[`p${activePlayer}Turn`].buyReserved = true;
  actionStarted = "buy reserved";
  logMessage = ` purchased a card previously reserved from the ${clickedCard.deck} deck, gained 1 ${clickedCard.color} bonus and ${clickedCard.points} point(s)`;
  actionIndex = 0;
  resetEventListeners();
}

function claimNobleHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (nobleClaimed > 0) {
    alert(`You may only claim 1 noble per turn! If you wish to claim a different one, click "Reset Turn" button`);
    return;
  }
  document.getElementById("player-notice").innerText = "Select a Noble to claim";
  document.getElementsByClassName("main-player-gem-row")[0].classList.add("ignore-me");
  document.getElementsByClassName("player-drop-down")[0].classList.add("ignore-me");
  document.getElementsByClassName("gems-column")[0].classList.add("ignore-me");
  for (var i = 1; i < 4; i++) {
    document.getElementsByClassName("action-buttons")[0].children[i].classList.add("ignore-me");
    document.getElementsByClassName("card-row")[i - 1].classList.add("ignore-me");
  }
  for (var i = 1; i < numberOfPlayers; i++) {
    document.getElementsByClassName("player-container")[i].classList.add("ignore-me");
  }
  document.getElementsByClassName("nobles-row")[0].classList.add("embiggen");
  removeEventListeners();
  for (var i = 0; i < noblesDeck.nobles.length; i++) {
    const button = gameBoardNobles.children[i];
    button.addEventListener("click", selectNoble);
  }
  //alert("Select a noble to claim.  To cancel, you must reset your turn");
}

function selectNoble(event) {
  let clickedNoble = event.target;
  let nobleIndex = Array.prototype.indexOf.call(clickedNoble.parentElement.children, clickedNoble);
  let claimedNoble = noblesDeck.nobles[nobleIndex];
  // Check if player qualifies for selected noble
  for (var i = 1; i <= 5; i++) {
    let cost = claimedNoble[`${gemOrder[i]}Val`];
    let playerValue = pData.bonus[gemOrder[i]];
    if (cost > playerValue) {
      alert("Nope");
      removeClass(["ignore-me", "embiggen"]);
      document.getElementById("player-notice").innerText = "";
      resetEventListeners();
      return;
    }
  }
  let playerScoreContainer = mainPlayerContainer.getElementsByClassName("player-score")[0];
  noblesDeck.nobles.splice(nobleIndex, 1); // Remove noble from deck
  event.target.remove();
  pData.nobles.push(claimedNoble); // Add noble to player's assets
  pData.points += 3;
  playerScoreContainer.innerText = `Score: ${pData.points}`;
  allPlayerScores[activePlayer - 1] = pData.points;
  checkForWinner();
  mainPlayerContainer.getElementsByClassName("player-noble")[0].innerHTML += `<img src="images\\nobles\\nobles-${claimedNoble.nobleId}.jpg" />`;
  nobleClaimed = 1;
  document.getElementById("player-notice").innerText = "";
  removeClass(["ignore-me", "embiggen"]);
  resetEventListeners();
  gameInfo[`p${activePlayer}Turn`].noble = true;
}

function startActionItems() {
  if (actionStarted == "none") {
    for (var i = 0; i < 12; i++) {
      gameBoardCards[i].classList.add("action-card");
    }
    for (var i = 0; i < 6; i++) {
      if (boardGems[gemOrder[i]] > 0) {
        gameBoardGems[i].classList.add("action-gem");
      }
    }
  } // Handle gem taking/returning
  else if (actionStarted == "gem" || actionStarted == "reserve") {
    // Remove all highlighting first - easier this way
    stopActionItems();
    // Player gems
    for (var i = 0; i < 5; i++) {
      if (pData.gems[gemOrder[i + 1]] > 0) {
        mainPlayerContainer.getElementsByClassName("player-gem-container")[i].classList.add("action-gem");
      }
    }
    // Board Gems (skip gold)
    if (actionIndex == 1 && actionStarted == "gem") {
      for (var i = 1; i < 6; i++) {
        let duplicate = takenGemColor.indexOf(gemOrder[i]) >= 0;
        if (boardGems[gemOrder[i]] > 0 && (boardGems[gemOrder[i]] > 2 || !duplicate) && (takenGemColor.length < 2 || !duplicate)) {
          gameBoardGems[i].classList.add("action-gem");
        }
      }
    }
  } else {
    stopActionItems();
  }
}

function stopActionItems() {
  for (var i = 0; i < 12; i++) {
    gameBoardCards[i].classList.remove("action-card");
  }
  for (var i = 0; i < 6; i++) {
    gameBoardGems[i].classList.remove("action-gem");
  }
  for (var i = 0; i < 5; i++) {
    mainPlayerContainer.getElementsByClassName("player-gem-container")[i].classList.remove("action-gem");
  }
}

function resetTurnHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  // Must differentiate between the first turn since reload and later ones - just like all row updates.
  if (resetState == "update") {
    newRowUpdate(resetData);
  } else if (resetState == "initial") {
    initialLoad(resetData);
  } else {
    alert("Something has gone very wrong with the reset. Press reload in your browser.");
    return;
  }
  takenGemColor = [];
  negativeGemColor = [];
  actionIndex = 1;
  actionStarted = "none";
  nobleClaimed = 0;
  gameInfo[`p${activePlayer}Turn`] = {};
  logMessage = "";
  dealNobles();
  dealGems();
  dealCards();
  updatePlayer(activePlayer, 0);
  checkForWinner();
  gemCheck();
  removeClass(["acted-on", "ignore-me", "embiggen", "emphasize", "negative-gem"]);
  document.getElementById("player-notice").innerText = "";
  startActionItems();
  resetEventListeners();
  // Remove purchased card and div if necessary
  let playerCards = pData.purchased_cards;
  let purchasedCardsContainer = mainPlayerContainer.getElementsByClassName("purchased-card-container")[0];
  if (purchasedCardsContainer) {
    if (playerCards.length == 0) {
      purchasedCardsContainer.parentElement.remove();
    } else {
      let purchasedCardCount = purchasedCardsContainer.getElementsByTagName("img").length;
      for (let i = playerCards.length; i < purchasedCardCount; i++) {
        purchasedCardsContainer.getElementsByTagName("img")[purchasedCardCount - 1].remove();
      }
    }
  }
}

function removeClass(classNames) {
  for (var i = 0; i < classNames.length; i++) {
    let classToRemove = classNames[i];
    let elementCount = document.getElementsByClassName(classToRemove).length;
    for (var j = 0; j < elementCount; j++) {
      document.getElementsByClassName(classToRemove)[0].classList.remove(classToRemove);
    }
  }
}

function checkForWinner() {
  removeClass(["winning"]);
  let highScore = Math.max(...allPlayerScores);
  // If no one has a winning score, do nothing else.
  if (highScore < winningScore) {
    return;
  }
  // Update the allPlayers object so any actions taken this turn will be used in this function
  getPData();
  allPlayers = { p1Data, p2Data, p3Data, p4Data };
  winnerArray = [];
  allPlayerScores.forEach((score, player) => {
    if (score == highScore) {
      winnerArray.push(player + 1);
    }
  });
  // If there is a tie score, eliminate players with more cards
  if (winnerArray.length > 1) {
    let lowestCards = allPlayers[`p${winnerArray[0]}Data`].purchased_cards.length;
    let i = 0;
    while (i < winnerArray.length) {
      let totalCards = allPlayers[`p${winnerArray[i]}Data`].purchased_cards.length;
      if (totalCards < lowestCards) {
        lowestCards = totalCards;
        i = 0;
      } else if (totalCards > lowestCards) {
        winnerArray.splice(i, 1);
        i = 0;
      } else i++;
    }
  }
  // Emphasize the winner's score on the game table
  winnerArray.forEach((winner) => {
    let winnerPosition = playerOrder.indexOf(winner);
    document.getElementsByClassName("player-score")[winnerPosition].classList.add("winning");
  });
  // If still tied, there are no more tie-breakers
  if (winnerArray.length == 1 && notifyWinner && inTurnPlayer != 1) {
    notifyWinner = false; // So the notification won't be repeated
    let winnerName = allPlayers[`p${winnerArray[0]}Data`].name;
    alert(`${winnerName} has ${highScore} points.  The game will end after this round.`);
  } else if (winnerArray.length > 1 && notifyWinner) {
    // There's actually a tie
    notifyWinner = false; // So the notification won't be repeated
    alert(
      `There is currently a ${winnerArray.length}-way tie at ${highScore} points (even after tie-breakers). Someone break the tie!!! 
      
The game will end after this round.`
    );
  }
}

function getPData() {
  if (activePlayer == 1) {
    p1Data = pData;
  }
  if (activePlayer == 2) {
    p2Data = pData;
  }
  if (activePlayer == 3) {
    p3Data = pData;
  }
  if (activePlayer == 4) {
    p4Data = pData;
  }
}

function highlightActions(player) {
  let position = playerOrder.indexOf(player);
  let inTurnPosition = playerOrder.indexOf(inTurnPlayer);
  // Only highlight recent action if it happened after active players last turn.  Always highlight active players last action.
  if (position != 0 && inTurnPosition != 0 && position >= inTurnPosition) {
    return;
  }
  let playerDiv = document.getElementsByClassName("player-container")[position];
  let lastPlayerTurn = gameInfo[`p${player}Turn`];
  for (let j = 1; j <= 5; j++) {
    if (lastPlayerTurn?.gems) {
      if (lastPlayerTurn.gems.indexOf(gemOrder[j]) >= 0) {
        playerDiv.getElementsByClassName("player-gem-container")[j - 1].getElementsByTagName("img")[0].classList.add("recent-action-img");
      }
    }
  }
  if (lastPlayerTurn?.reservedCard) {
    let reserveContainer = playerDiv.getElementsByClassName("reserved-card-container")[0];
    reserveContainer.parentElement.getElementsByTagName("summary")[0].classList.add("recent-action-text");
    reserveContainer.lastChild.classList.add("recent-action-img");
    let thisCard = lastPlayerTurn.reservedCard;
    document.getElementById(`board-${thisCard.deck}-${thisCard.position + 1}`).classList.add("recent-action-img");
    playerDiv.getElementsByClassName("player-gold-gem")[0].lastElementChild.classList.add("recent-action-img");
  }
  if (lastPlayerTurn?.purchasedCard) {
    let purchaseContainer = playerDiv.getElementsByClassName("purchased-card-container")[0];
    purchaseContainer.parentElement.getElementsByTagName("summary")[0].classList.add("recent-action-text");
    purchaseContainer.lastChild.classList.add("recent-action-img");
    let thisCard = lastPlayerTurn.purchasedCard;
    document.getElementById(`board-${thisCard.deck}-${thisCard.position + 1}`).classList.add("recent-action-img");
  }
  if (lastPlayerTurn?.buyReserved) {
    let purchaseContainer = playerDiv.getElementsByClassName("purchased-card-container")[0];
    purchaseContainer.parentElement.getElementsByTagName("summary")[0].classList.add("recent-action-text");
    purchaseContainer.lastChild.classList.add("recent-action-img");
  }
  if (lastPlayerTurn?.noble) {
    let nobleContainer = playerDiv.getElementsByClassName("player-noble")[0];
    nobleContainer.lastChild.classList.add("recent-action-img");
  }
}

function endTurnHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (actionStarted == "none") {
    alert("Please take your turn");
    return;
  }
  totalPlayerGems = 0;
  for (var i in pData.gems) {
    totalPlayerGems += pData.gems[i];
  }
  // Notify player if turn wasn't completed, allowing for ending turn with less than full turn if player has 10 gems, or if no more gems remain.
  if (actionIndex == 1 && ((totalPlayerGems < 10 && remainingGemColor.length > 0) || actionStarted != "gem")) {
    alert(`Please complete your "${actionStarted}" action`);
    return;
  }
  // Enforce 10 gem max
  if (totalPlayerGems > 10) {
    alert(`You currently have ${totalPlayerGems} gems. You may not have more than 10, including Gold gems.
    
Please return ${totalPlayerGems - 10} gem(s) by clicking on the image of the gem you want to return under your name.
    
Gold gems can only be returned if if you took them this turn by clicking the "Reset Turn" button.`);
    return;
  }
  // Update log for gem actions - way easier to do it this way than with the click handlers for each click.
  if (actionStarted == "gem") {
    logMessage = ` took ${takenGemColor.length} gems: ${takenGemColor.join(", ")}`;
  }
  // This could also be relevant if reserving a card
  if (negativeGemColor.length > 0) {
    logMessage += ` - and returned ${negativeGemColor.length} gems: ${negativeGemColor.join(", ")}`;
  }
  round = parseInt(gameData.save_id.toString().slice(0, -2));
  gameInfo.log[`round_${round}`][activePlayer].message = logMessage;
  logMessage = "";
  if (nobleClaimed == 1) gameInfo.log[`round_${round}`][activePlayer].noble = ` took a noble and gained 3 points`;
  if (inTurnPlayer == numberOfPlayers) {
    round += 1;
    inTurnPlayer = 1;
    gameInfo.log[`round_${round}`] = { 1: {} };
    // Update winner info
    gameInfo.winner = winnerArray;
  } else {
    inTurnPlayer += 1;
    gameInfo.log[`round_${round}`][inTurnPlayer] = {};
  }

  getPData();
  var body = {
    game_id: gameId,
    players: numberOfPlayers,
    save_id: `${round}.${inTurnPlayer}`,
    game_info: gameInfo,
    nobles: noblesDeck.nobles,
    blue_deck: blueDeck.cards,
    yellow_deck: yellowDeck.cards,
    green_deck: greenDeck.cards,
    board_gems: {
      gold: boardGems.gold,
      black: boardGems.black,
      red: boardGems.red,
      green: boardGems.green,
      blue: boardGems.blue,
      white: boardGems.white,
    },
    player_1: p1Data,
    player_2: p2Data,
    player_3: p3Data,
    player_4: p4Data,
  };
  socket.emit("new-row", body);
  actionIndex = 1;
  actionStarted = "none";
  nobleClaimed = 0;
  takenGemColor = [];
  updateLog("endTurn");
  removeClass(["acted-on", "negative-gem", "recent-action-img", "recent-action-text"]);
  document.getElementById("in-turn-player").removeAttribute("id");
  document.getElementsByClassName("action-buttons")[0].classList.add("invisible");
  stopActionItems();
  updateFavicon();
  // If game is over, go to game over page
  if (inTurnPlayer == 1 && winnerArray.length > 0) {
    socket.emit("end-game", gameId);
    let gameLink = "game-over" + "?game_id=" + gameId + "&p=p" + activePlayer;
    let mischiefLevel = gameInfo.mischief;
    if (mischiefLevel) gameLink += "&m=" + mischiefLevel;
    setTimeout(function () {
      window.location = gameLink;
    }, 5000);
    document.getElementById("turn-marker").innerText = "Game Over";
    return;
  }
  // Set up table for next turn
  let playerDiv = document.getElementsByClassName("player-container")[playerOrder.indexOf(inTurnPlayer)];
  playerDiv.id = "in-turn-player";
  document.getElementById("turn-marker").innerText = `${body[`player_${inTurnPlayer}`].name}'s Turn`;
  document.getElementById("round-counter").innerText = `Round: ${round}`;
  dealCards();
  highlightActions(activePlayer);
}

function updateFavicon() {
  if (pData.gems.gold > 0) {
    document.getElementById("favicon").href = "./images/favicons/favicon-gold-32x32.png";
    return;
  }
  let maxGem = "red";
  let gemCount = 0;
  for (let i = 1; i < 6; i++) {
    if (pData.gems[gemOrder[i]] > gemCount) {
      gemCount = pData.gems[gemOrder[i]];
      maxGem = gemOrder[i];
    }
  }
  document.getElementById("favicon").href = `./images/favicons/favicon-${maxGem}-32x32.png`;
}

function updateLog(mode = "reload") {
  const logElement = document.getElementById("game-log");
  for (let i = logRound; i <= round; i++) {
    // When logTurn is 0, a new round is created in the log HTML
    if (logTurn === 0) {
      const newRound = document.createElement("div");
      newRound.classList.add("game-log-emphasize");
      newRound.innerText = `Round ${i}:`;
      logElement.appendChild(newRound);
      logTurn++;
    }
    for (let j = logTurn; j <= numberOfPlayers; j++) {
      if (gameInfo.log?.[`round_${i}`]?.[j]?.message) {
        const logName = document.createElement("span");
        logName.classList.add("log-name", `player-${j}`);
        logName.innerText = allPlayers[`p${j}Data`].name;
        const newMessage = document.createElement("div");
        newMessage.classList.add("game-log-item");
        newMessage.innerText = gameInfo.log[`round_${i}`][j].message;
        newMessage.prepend(logName);
        logElement.appendChild(newMessage);
        if (j == numberOfPlayers) {
          logTurn = 0;
          logRound++;
        } else logTurn++;
      }
      if (gameInfo.log?.[`round_${i}`]?.[j]?.noble) {
        const logName = document.createElement("span");
        logName.classList.add("log-name", `player-${j}`);
        logName.innerText = allPlayers[`p${j}Data`].name;
        const newMessage = document.createElement("div");
        newMessage.classList.add("game-log-item");
        newMessage.innerText = gameInfo.log[`round_${i}`][j].noble;
        newMessage.prepend(logName);
        logElement.appendChild(newMessage);
        // If in current round, play a sound to notify users a noble was taken (but not the user that actually took it)
        if ((i == round || (i == round - 1 && inTurnPlayer == 1)) && j != activePlayer && audioToggle.checked) {
          var bumpSound = new Audio("./sounds/bump.mp3");
          bumpSound.play();
        }
      }
    }
  }
  const blockSize = cssRoot.style.getPropertyValue("--block-size").slice(0, -2); // Remove the "px" from the end
  logElement.scrollTo(0, logElement.scrollHeight - blockSize); // Keep the game log scrolled to the bottom
}

function roundClickHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  // If the round counter is clicked 10 times in under 3 seconds, up the mischief level of the game by 1.  After level 3, reset to 0.
  clickCounter += 1;
  if (clickCounter === 1) {
    timerId = setTimeout(() => {
      clickCounter = 0;
      console.log("counter reset");
    }, 3000);
  }
  if (clickCounter === 10) {
    clickCounter = 0;
    if (!gameInfo.mischief) gameInfo.mischief = 1;
    else if (gameInfo.mischief === 3) gameInfo.mischief = 0;
    else gameInfo.mischief += 1;
    clearTimeout(timerId);
    console.log("mischief level: " + gameInfo.mischief);
  }
}

function playerScoreClickHandler(event) {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  // If the round counter is clicked 10 times in under 3 seconds, mark the selected player for more mischief
  clickCounter += 1;
  if (clickCounter === 1) {
    timerId = setTimeout(() => {
      clickCounter = 0;
      console.log("counter reset");
    }, 3000);
  }
  if (clickCounter === 10) {
    clickCounter = 0;
    clearTimeout(timerId);
    const selectedPlayer = playerOrder.indexOf(parseInt(event.target.id.slice(-1))) + 1;
    const selectedName = prompt(`Please enter the name of the person to mess with.
    
To remove the person from the list of names to be messed with, enter: XXX`);
    if (!selectedName) return;
    if (selectedName === "XXX") {
      delete gameInfo.selectedPlayers[selectedPlayer];
      console.log(`player ${selectedPlayer} will no longer be messed with.`);
      return;
    }
    if (!gameInfo.selectedPlayers) {
      gameInfo.selectedPlayers = {};
    }
    gameInfo.selectedPlayers[selectedPlayer] = selectedName;
    console.log(`player ${selectedPlayer} - "${selectedName}" - selected`);
  }
}
