export default class BlueDeck {
   constructor(blueCards = freshBlueDeck()) {
      this.blueCards = blueCards;
   }

   get numberOfCards() {
      return this.blueCards.length;
   }

   shuffle() {
      /*Goes through the deck one card at a time starting at the bottom and swaps the card with a random card in the deck
       came from WebDevSimplified card game video*/
      for (let i = this.numberOfCards - 1; i > 0; i--) {
         const newIndex = Math.floor(Math.random() * (i + 1));
         const oldValue = this.blueCards[newIndex];
         this.blueCards[newIndex] = this.blueCards[i];
         this.blueCards[i] = oldValue;
      }
   }
}

class BlueCard {
   constructor(cardId, points, color, black, red, green, blue, white) {
      this.cardId = cardId;
      this.points = points;
      this.color = color;
      this.black = black;
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.white = white;
   }
}

function freshBlueDeck() {
   const BC01 = new BlueCard("01", 4, "green", 0, 0, 3, 6, 3);

   return [BC01];
}
