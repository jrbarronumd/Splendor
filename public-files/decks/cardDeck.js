export default class CardsDeck {
   constructor(cards = blankDeck()) {
      this.cards = cards;
   }

   get numberOfCards() {
      return this.cards.length;
   }

   blueDeck() {
      freshBlueDeck(this.cards, this.numberOfCards);
   }

   yellowDeck() {
      freshYellowDeck(this.cards, this.numberOfCards);
   }

   greenDeck() {
      freshGreenDeck(this.cards, this.numberOfCards);
   }

   shuffle() {
      /*Goes through the deck one card at a time starting at the bottom and swaps the card with a random card in the deck
       came from WebDevSimplified card game video*/
      for (let i = this.numberOfCards - 1; i > 0; i--) {
         const newIndex = Math.floor(Math.random() * (i + 1));
         const oldValue = this.cards[newIndex];
         this.cards[newIndex] = this.cards[i];
         this.cards[i] = oldValue;
      }
   }

   deal() {
      return this.cards.shift();
   }
}

class Card {
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

function blankDeck() {
   const Blank01 = new Card("00", 0, "None", 0, 0, 0, 0, 0);
   const Blank02 = new Card("00", 0, "None", 0, 0, 0, 0, 0);
   return [Blank01, Blank02];
}

function freshBlueDeck(activeDeck, oldCards) {
   const BC01 = new Card("01", 5, "black", 3, 7, 0, 0, 0);
   const BC02 = new Card("02", 4, "black", 3, 6, 3, 0, 0);
   const BC03 = new Card("03", 4, "black", 0, 7, 0, 0, 0);
   const BC04 = new Card("04", 3, "black", 0, 3, 5, 3, 3);
   const BC05 = new Card("05", 5, "red", 0, 3, 7, 0, 0);
   const BC06 = new Card("06", 4, "red", 0, 3, 6, 3, 0);
   const BC07 = new Card("07", 4, "red", 0, 0, 7, 0, 0);
   const BC08 = new Card("08", 3, "red", 3, 0, 3, 5, 3);
   const BC09 = new Card("09", 5, "green", 0, 0, 3, 7, 0);
   const BC10 = new Card("10", 4, "green", 0, 0, 3, 6, 3);
   const BC11 = new Card("11", 4, "green", 0, 0, 0, 7, 0);
   const BC12 = new Card("12", 3, "green", 3, 3, 0, 3, 5);
   const BC13 = new Card("13", 5, "blue", 0, 0, 0, 3, 7);
   const BC14 = new Card("14", 4, "blue", 3, 0, 0, 3, 6);
   const BC15 = new Card("15", 4, "blue", 0, 0, 0, 0, 7);
   const BC16 = new Card("16", 3, "blue", 5, 3, 3, 0, 3);
   const BC17 = new Card("17", 5, "white", 7, 0, 0, 0, 3);
   const BC18 = new Card("18", 4, "white", 6, 3, 0, 0, 3);
   const BC19 = new Card("19", 4, "white", 7, 0, 0, 0, 0);
   const BC20 = new Card("20", 3, "white", 3, 5, 3, 3, 0);

   activeDeck.splice(
      0,
      oldCards,
      BC01,
      BC02,
      BC03,
      BC04,
      BC05,
      BC06,
      BC07,
      BC08,
      BC09,
      BC10,
      BC11,
      BC12,
      BC13,
      BC14,
      BC15,
      BC16,
      BC17,
      BC18,
      BC19,
      BC20
   );
}

function freshYellowDeck(activeDeck, oldCards) {
   const YC01 = new Card("01", 3, "black", 6, 0, 0, 0, 0);
   const YC02 = new Card("02", 2, "black", 0, 0, 0, 0, 5);
   const YC03 = new Card("03", 2, "black", 0, 2, 4, 1, 0);
   activeDeck.splice(0, oldCards, YC01, YC02);
}
