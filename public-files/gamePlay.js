import NoblesDeck from "./decks/noblesDeck.js";
import BlueDeck from "./decks/blueDeck.js";
var numberOfPlayers = 3;

const noblesDeck = new NoblesDeck();
const blueDeck = new BlueDeck();
console.log(blueDeck.blueCards);

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
   for (let i = 1; i <= 4; i++) {
      document.getElementById(`board-green-${i}`).src = `images\\cards\\green-0${i}.jpg`;
      document.getElementById(`board-yellow-${i}`).src = `images\\cards\\yellow-0${i}.jpg`;
      document.getElementById(`board-blue-${i}`).src = `images\\cards\\blue-0${i}.jpg`;
   }
}
