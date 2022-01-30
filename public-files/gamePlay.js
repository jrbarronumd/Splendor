import NoblesDeck from "./decks/noblesDeck.js";
import CardsDeck from "./decks/cardDeck.js";

// TODO: Turn player gem count text red (or some other color) when totalPlayerGems > 10
// The 10 gem max and returning gems should be stress tested.  Make sure players can't cheat or be cheated with what they can/can't return
// Also make it obvious when someone eclipses 15 points
// Need a game log
// Reset Turn button should not actually reload the page.
// Outline recently replaced cards and taken gems (double outline if double taken) - use player color in outline???
// Delete games from db when complete, or at least all but one row.
// Can't return a gem if you take a gold gem and have more than 10 total...
// What happens when someone wins?!?
// TODO: Need to handle when the deck is running out of cards!!
const socket = io();
var numberOfPlayers, gameData, pData, boardGems, totalPlayerGems, p1Data, p2Data, p3Data, p4Data;
var takenGemColor = [];
var allPlayers = {};
var playerOrder = [0, 1, 2, 3, 4, 1, 2, 3];
var myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");
var activePlayer = parseInt(myQueryString.get("p").slice(-1));
var inTurnPlayer = 0;
var gemOrder = ["gold", "white", "blue", "green", "red", "black"];
var actionIndex = 1; // 0 will stop any actions
var actionStarted = "none"; // Possibilities: none, gem, card
var nobleClaimed = 0; // Change to 1 on reservation to ensure only one per turn

var noblesDeck = new NoblesDeck();
var blueDeck = new CardsDeck();
var yellowDeck = new CardsDeck();
var greenDeck = new CardsDeck();
var blankDeck = new CardsDeck(); // To be used when a deck runs out of cards

var mainPlayerContainer = document.getElementsByClassName("main-player-container")[0];
var boardGemContainer = document.getElementsByClassName("gems-column")[0];
var gameBoardCards = document.getElementsByClassName("card-container");
var gameBoardGems = boardGemContainer.getElementsByClassName("gem-container");
var gameBoardNobles = document.getElementsByClassName("nobles-row")[0];
var resetTurnButton = document.getElementById("reset-turn");
var endTurnButton = document.getElementById("end-turn");
var buyReservedButton = document.getElementById("buy-reserved");
var claimNobleButton = document.getElementById("claim-noble");
resetTurnButton.addEventListener("click", resetTurnHandler); // Should never be removed

function resetEventListeners() {
  endTurnButton.addEventListener("click", endTurnHandler);
  buyReservedButton.addEventListener("click", buyReservedHandler);
  claimNobleButton.addEventListener("click", claimNobleHandler);
  for (var i = 0; i < 12; i++) {
    const button = gameBoardCards[i].children[0];
    button.removeEventListener("click", reserveCard);
    button.addEventListener("click", boardCardClickHandler);
  }
  for (var i = 0; i < 6; i++) {
    const button = gameBoardGems[i].getElementsByTagName("img")[0];
    button.addEventListener("click", boardGemClickHandler);
  }
  for (var i = 0; i < 5; i++) {
    const button = mainPlayerContainer.getElementsByClassName("gem-img")[i];
    button.addEventListener("click", playerGemClickHandler);
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
  for (var i = 0; i < noblesDeck.nobles.length; i++) {
    const button = gameBoardNobles.children[i];
    button.removeEventListener("click", selectNoble);
  }
}

// As soon as connection is made, join user to the game's socket room, which will initiate game data push
socket.on("connect", () => {
  socket.emit("game-load", gameId, activePlayer);
});

// When connection is confirmed by server, log socket ID to console
socket.on("connected", (result) => {
  console.log(result);
});

// TODO: Use a disconnect event to handle server/client failures?

// Server pushed gameData after connection.  This is the initial game-load ONLY.
socket.once("game-data", (respData) => {
  gameData = respData;
  numberOfPlayers = JSON.parse(gameData.players);
  pData = JSON.parse(gameData[`player_${activePlayer}`]);
  boardGems = JSON.parse(gameData.board_gems);
  inTurnPlayer = parseInt(gameData.save_id.toString().slice(-1));
  noblesDeck.nobles = JSON.parse(gameData.nobles);
  blueDeck.cards = JSON.parse(gameData.blue_deck);
  yellowDeck.cards = JSON.parse(gameData.yellow_deck);
  greenDeck.cards = JSON.parse(gameData.green_deck);
  p1Data = JSON.parse(gameData.player_1);
  p2Data = JSON.parse(gameData.player_2);
  p3Data = JSON.parse(gameData.player_3);
  p4Data = JSON.parse(gameData.player_4);
  allPlayers = { p1Data, p2Data, p3Data, p4Data };
  dealNobles();
  dealGems();
  dealCards();
  setTable();
});

// This will be executed every time another player finishes a turn
socket.on("new-row-result", (newData) => {
  let previousPlayer = inTurnPlayer;
  let previousPosition = playerOrder.indexOf(previousPlayer);
  gameData = newData;
  let round = parseInt(gameData.save_id.toString().slice(0, -2));
  numberOfPlayers = gameData.players;
  pData = gameData[`player_${activePlayer}`];
  boardGems = gameData.board_gems;
  inTurnPlayer = parseInt(gameData.save_id.toString().slice(-1));
  noblesDeck.nobles = gameData.nobles;
  blueDeck.cards = gameData.blue_deck;
  yellowDeck.cards = gameData.yellow_deck;
  greenDeck.cards = gameData.green_deck;
  p1Data = gameData.player_1;
  p2Data = gameData.player_2;
  p3Data = gameData.player_3;
  p4Data = gameData.player_4;
  allPlayers = { p1Data, p2Data, p3Data, p4Data };

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
  for (var i = 0; i < 4; i++) {
    document.getElementById(`board-blue-${i + 1}`).src = `images/cards/blue-${blueDeck.cards[i].cardId}.jpg`;
    document.getElementById(`board-yellow-${i + 1}`).src = `images/cards/yellow-${yellowDeck.cards[i].cardId}.jpg`;
    document.getElementById(`board-green-${i + 1}`).src = `images/cards/green-${greenDeck.cards[i].cardId}.jpg`;
  }
  deckCounter();
}

function setTable() {
  // Anything that should only run once upon loading the page should go here.
  playerOrder = playerOrder.filter((x) => x <= numberOfPlayers); // remove any numbers higher than numberOfPlayers
  playerOrder = playerOrder.slice(activePlayer, activePlayer + numberOfPlayers);
  document.getElementsByClassName("player-container")[playerOrder.indexOf(inTurnPlayer)].id = "in-turn-player";
  document.getElementById("turn-marker").innerText = `${JSON.parse(gameData[`player_${inTurnPlayer}`]).name}'s Turn`;
  let round = parseInt(gameData.save_id.toString().slice(0, -2));
  document.getElementById("round-counter").innerText = `Round: ${round}`;
  // First delete the extra player divs (I think easier than starting with 2)
  for (var i = 4; i > numberOfPlayers; i--) {
    document.getElementsByClassName("player-container")[i - 1].remove();
  }
  // Player divs will be populated by turn order starting with the active player at the top
  for (var i = 0; i < numberOfPlayers; i++) {
    let currentPlayerNum = playerOrder[i];
    updatePlayer(currentPlayerNum, i);
    let playerDiv = document.getElementsByClassName("player-container")[i];
    playerDiv.classList.replace(`player-${i + 1}`, `player-${playerOrder[i]}`);
  }
  console.log(`Active Player: ${pData.name}`);
  resetEventListeners();
}

function updatePlayer(player, playerPosition) {
  let playerDiv = document.getElementsByClassName("player-container")[playerPosition];
  let playerData = allPlayers[`p${player}Data`];
  let playerName = playerData.name;
  playerDiv.getElementsByClassName("player-name")[0].innerText = playerName;
  let playerScore = playerData.points;
  playerDiv.getElementsByClassName("player-score")[0].innerText = `Score: ${playerScore}`;
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
  for (let j = 1; j <= 5; j++) {
    // Cycle through each gem color other than gold
    playerDiv.getElementsByClassName("player-gem-count")[j - 1].innerText = playerGems[gemOrder[j]]; //gold is first, so it is just skipped
    playerDiv.getElementsByClassName("player-bonus")[j - 1].innerText = `(${playerBonus[gemOrder[j]]})`;
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
      let newElement = document.createElement("details");
      newElement.classList.add("player-details");
      newElement.setAttribute("open", true);
      let newElementContents = `
        <summary>Reserved Cards</summary>
        <div class="reserved-card-container">
        </div>`;
      newElement.innerHTML = newElementContents;
      dropDownContainer.insertBefore(newElement, dropDownContainer.firstChild);
    }
    reserveContainer = playerDiv.getElementsByClassName("reserved-card-container")[0];
    for (let j = existingReserved; j < reserveCount; j++) {
      reserveContainer.innerHTML += `<img src="images/cards/${reservedCards[j].deck}-${reservedCards[j].cardId}.jpg" />`;
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
      <summary>Purchased Cards</summary>
      <div class="purchased-card-container">
      </div>`;
      newElement.innerHTML = newElementContents;
      dropDownContainer.append(newElement);
    }
    purchaseContainer = playerDiv.getElementsByClassName("purchased-card-container")[0];
    for (let j = existingPurchased; j < purchaseCount; j++) {
      purchaseContainer.innerHTML += `<img src="images/cards/${purchasedCards[j].deck}-${purchasedCards[j].cardId}.jpg" />`;
    }
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
  let playerScoreContainer = mainPlayerContainer.getElementsByClassName("player-score")[0];
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
  // Validate purchase
  let surplus = pData.gems.gold;
  for (let i = 1; i <= 5; i++) {
    // Create purchase power array of gems + bonuses, not including gold gems
    let purchasePower = pData.gems[gemOrder[i]] + pData.bonus[gemOrder[i]];
    surplus += Math.min(0, purchasePower - purchasedCard[gemOrder[i]]);
    // Remaining surplus is remaining gold. Negative number means the player can't afford it.
    if (surplus < 0) {
      return; // Can't afford card. No alert message.
    }
  }
  // Pay for card, and add spent gems to board
  for (let i = 1; i <= 5; i++) {
    let cost = Math.max(0, purchasedCard[gemOrder[i]] - pData.bonus[gemOrder[i]]); // max function will handle if bonus is greater than total cost of a color
    cost = Math.min(cost, pData.gems[gemOrder[i]]); // This will catch if golds are needed, so player gems don't go negative
    pData.gems[gemOrder[i]] -= cost;
    boardGems[gemOrder[i]] += cost;
    mainPlayerContainer.getElementsByClassName("player-gem-count")[i - 1].innerText = pData.gems[gemOrder[i]];
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
      <summary>Purchased Cards</summary>
      <div class="purchased-card-container">
      </div>`;
    newElement.innerHTML = newElementContents;
    dropDownContainer.append(newElement);
  }
  let purchaseContainer = mainPlayerContainer.getElementsByClassName("purchased-card-container")[0];
  newCard = activeDeck.cards[4];
  activeDeck.cards.splice(4, 1); // Remove next card from deck, so it can be placed in the hole left by the purchased card
  activeDeck.cards.splice(deckIndex, 1, newCard);
  pData.purchased_cards.push(purchasedCard); // Add card to player's purchased cards
  purchaseContainer.innerHTML += `<img src="images/cards/${deckColor}-${purchasedCard.cardId}.jpg" />`;
  event.target.src = `images/cards/${deckColor}-00.jpg`; // Replace purchased card with face-down card
  // event.target.src = `images/cards/${deckColor}-${newCard.cardId}.jpg`; // For Troubleshooting only!
  pData.points += purchasedCard.points;
  playerScoreContainer.innerText = `Score: ${pData.points}`;
  // Add the gained color bonus to the table and pData
  pData.bonus[purchasedCard.color] += 1;
  let bonusGemContainer = mainPlayerContainer.getElementsByClassName("player-gem-container")[gemOrder.indexOf(purchasedCard.color) - 1];
  bonusGemContainer.getElementsByClassName("player-bonus")[0].innerText = `(${pData.bonus[purchasedCard.color]})`;
  actionStarted = "card";
  actionIndex = 0;
  deckCounter();
}

function boardGemClickHandler(event) {
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
  if (activePlayer == inTurnPlayer) {
    let clickedContainer = event.target.parentElement;
    let gemIndex = Array.prototype.indexOf.call(clickedContainer.parentElement.children, clickedContainer);
    let boardCountContainer = clickedContainer.getElementsByClassName("board-gem-count")[0];
    let boardCount = parseInt(boardCountContainer.innerText);
    let gemColor = gemOrder[gemIndex];
    if (gemIndex == 0) {
      goldGemHandler();
      return;
    }
    if (boardCount == 0) {
      alert(`There are no ${gemColor} gems left`);
      return;
    }
    let duplicate = takenGemColor.find((color) => color == gemColor); // Will return gem color if it finds a duplicate
    if (duplicate === gemColor) {
      // If the clicked color has already been clicked in this turn
      if (takenGemColor.length > 1) {
        alert("You've already taken 2 gems. You can't take a duplicate at this time.");
        return;
      } else if (boardCount < 3) {
        alert("You cannot take 2 gems of the same color unless there were 4 in stack at the start of your turn.");
        return;
      } else if (takenGemColor.length == 1) {
        actionIndex = 0; // If legally taking 2 of 1 color, disable further actions
      }
    }
    actionStarted = "gem";
    boardGems[gemColor] -= 1;
    boardCountContainer.innerText -= 1;
    let playerCountContainer = mainPlayerContainer.getElementsByClassName("player-gem-count")[gemIndex - 1];
    let playerGemCount = parseInt(playerCountContainer.innerText);
    pData.gems[gemColor] += 1;
    playerGemCount += 1;
    playerCountContainer.innerText = playerGemCount;
    takenGemColor.push(gemColor);
    if (takenGemColor.length == 3) {
      actionIndex = 0; // Turn complete
    }
  }
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
    <summary>Reserved Cards</summary>
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
  }
  removeEventListeners();
  for (var i = 0; i < 12; i++) {
    const button = gameBoardCards[i].children[0];
    button.addEventListener("click", reserveCard);
  }
  //alert("Select a card to reserve.  To cancel, you must reset your turn");
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
  reserveContainer.innerHTML += `<img src="images/cards/${deckColor}-${reservedCard.cardId}.jpg" />`;
  event.target.src = `images/cards/${deckColor}-00.jpg`; // Replace reserved card with face-down card
  // event.target.src = `images/cards/${deckColor}-${newCard.cardId}.jpg`; // For Troubleshooting only!
  actionIndex = 0; // Disable further actions after reserving is complete
  deckCounter();
  resetEventListeners();
}

function playerGemClickHandler(event) {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (actionStarted != "gem") {
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
    // If gem is being returned is one that was taken this turn, another gem can be taken (remove from takenGemColor)
    takenGemColor.splice(gemReturn, 1);
    actionIndex = 1;
  }
  pData.gems[gemColor] -= 1;
  playerCountContainer.innerText -= 1;
  boardGems[gemColor] += 1;
  boardCountContainer.innerText = boardCount + 1;
}

// TODO: Do better with this
function resetTurnHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  location.reload();
}

function buyReservedHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  console.log("buy reserved");
}

function claimNobleHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  if (nobleClaimed > 0) {
    alert(`You may only claim 1 noble per turn! If you wish to claim a different one, click "Reset Turn" button`);
    return;
  }
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
  mainPlayerContainer.getElementsByClassName("player-noble")[0].innerHTML += `<img src="images\\nobles\\nobles-${claimedNoble.nobleId}.jpg" />`;
  //socket message to other players to re-deal nobles and load the img and score??
  //end turn button already pushed the deal nobles function...
  nobleClaimed = 1;
  resetEventListeners();
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

function endTurnHandler() {
  if (activePlayer != inTurnPlayer) {
    return;
  }
  // Enforce 10 gem max
  totalPlayerGems = 0;
  for (var i in pData.gems) {
    totalPlayerGems += pData.gems[i];
  }
  if (totalPlayerGems > 10) {
    alert(`You currently have ${totalPlayerGems} gems. You may not have more than 10, including Gold gems.
    
Please return ${totalPlayerGems - 10} gem(s) by clicking on the image of the gem you want to return under your name.
    
Gold gems can only be returned if if you took them this turn by clicking the "Reset Turn" button.`);
    return;
  }
  let round = parseInt(gameData.save_id.toString().slice(0, -2));
  if (inTurnPlayer == numberOfPlayers) {
    round += 1;
    inTurnPlayer = 1;
  } else {
    inTurnPlayer += 1;
  }

  getPData();
  var body = {
    game_id: gameId,
    players: numberOfPlayers,
    save_id: `${round}.${inTurnPlayer}`,
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
  // Clear outlined player container, and move to next player
  document.getElementById("in-turn-player").removeAttribute("id");
  let playerDiv = document.getElementsByClassName("player-container")[playerOrder.indexOf(inTurnPlayer)];
  playerDiv.id = "in-turn-player";
  document.getElementById("turn-marker").innerText = `${body[`player_${inTurnPlayer}`].name}'s Turn`;
  document.getElementById("round-counter").innerText = `Round: ${round}`;
  dealCards();
}
