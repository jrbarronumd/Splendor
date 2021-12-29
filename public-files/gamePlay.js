import NoblesDeck from "./decks/noblesDeck.js";
var numberOfPlayers = 2;

const noblesDeck = new NoblesDeck();
console.log(noblesDeck.nobles);

// place proper number of nobles and adjust size
//TODO: adjust nobles-row img{} CSS to change max-width
for (let i = 2; i < numberOfPlayers; i++) {
   console.log(i);
   let noblesContainer = document.getElementsByClassName("nobles-row")[0];
   let newDivContents = `<img src="images\\nobles\\nobles-00.jpg" />`;
   noblesContainer.innerHTML += newDivContents;
}
