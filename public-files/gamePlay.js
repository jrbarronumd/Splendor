import NoblesDeck from "./decks/noblesDeck.js";
import CardsDeck from "./decks/cardDeck.js";
var numberOfPlayers = 3;
var gameBoardCards = document.getElementsByClassName("board-card");
var gameBoardGems = document.getElementsByClassName("board-gem");

for (var i = 0; i < 12; i++) {
   const button = gameBoardCards[i];
   button.addEventListener("click", boardCardClickHandler);
}

for (var i = 0; i < 6; i++) {
   const button = gameBoardGems[i];
   button.addEventListener("click", boardGemClickHandler);
}

const noblesDeck = new NoblesDeck();
const blueDeck = new CardsDeck();
const yellowDeck = new CardsDeck();
const greenDeck = new CardsDeck();

blueDeck.blueDeck();
yellowDeck.yellowDeck();
greenDeck.greenDeck();

// place proper number of nobles and adjust size
//TODO: adjust nobles-row img{} CSS to change max-width
dealCards();
function dealCards() {
   noblesDeck.shuffle();
   console.log(noblesDeck.nobles);
   let noblesContainer = document.getElementsByClassName("nobles-row")[0];
   let newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[0].nobleId}.jpg" />`;
   noblesContainer.innerHTML = newDivContents;
   for (let i = 1; i < numberOfPlayers + 1; i++) {
      newDivContents = `<img src="images\\nobles\\nobles-${noblesDeck.nobles[i].nobleId}.jpg" />`;
      noblesContainer.innerHTML += newDivContents;
   }
   blueDeck.shuffle();
   yellowDeck.shuffle();
   greenDeck.shuffle();
   console.log(blueDeck.cards);
   console.log(yellowDeck.cards);
   console.log(greenDeck.cards);

   for (let i = 0; i < 4; i++) {
      const dealBlueCard = blueDeck.deal();
      const dealYellowCard = yellowDeck.deal();
      const dealGreenCard = greenDeck.deal();
      document.getElementById(`board-blue-${i + 1}`).src = `images\\cards\\blue-${dealBlueCard.cardId}.jpg`;
      document.getElementById(`board-yellow-${i + 1}`).src = `images\\cards\\yellow-${dealYellowCard.cardId}.jpg`;
      document.getElementById(`board-green-${i + 1}`).src = `images\\cards\\green-${dealGreenCard.cardId}.jpg`;
   }
}

function boardCardClickHandler() {
   console.log("Card clicked");
}

function boardGemClickHandler() {
   console.log("Gem clicked");
}
