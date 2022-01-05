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
  const YC04 = new Card("04", 2, "black", 0, 3, 5, 0, 0);
  const YC05 = new Card("05", 1, "black", 0, 0, 2, 2, 3);
  const YC06 = new Card("06", 1, "black", 2, 0, 3, 0, 3);
  const YC07 = new Card("07", 3, "red", 0, 6, 0, 0, 0);
  const YC08 = new Card("08", 2, "red", 5, 0, 0, 0, 0);
  const YC09 = new Card("09", 2, "red", 0, 0, 2, 4, 1);
  const YC10 = new Card("10", 2, "red", 5, 0, 0, 0, 3);
  const YC11 = new Card("11", 1, "red", 3, 2, 0, 0, 2);
  const YC12 = new Card("12", 1, "red", 3, 2, 0, 3, 0);
  const YC13 = new Card("13", 3, "green", 0, 0, 6, 0, 0);
  const YC14 = new Card("14", 2, "green", 0, 0, 5, 0, 0);
  const YC15 = new Card("15", 2, "green", 1, 0, 0, 2, 4);
  const YC16 = new Card("16", 2, "green", 0, 0, 3, 5, 0);
  const YC17 = new Card("17", 1, "green", 2, 0, 0, 3, 2);
  const YC18 = new Card("18", 1, "green", 0, 3, 2, 0, 3);
  const YC19 = new Card("19", 3, "blue", 0, 0, 0, 6, 0);
  const YC20 = new Card("20", 2, "blue", 0, 0, 0, 5, 0);
  const YC21 = new Card("21", 2, "blue", 4, 1, 0, 0, 2);
  const YC22 = new Card("22", 2, "blue", 0, 0, 0, 3, 5);
  const YC23 = new Card("23", 1, "blue", 0, 3, 2, 2, 0);
  const YC24 = new Card("24", 1, "blue", 3, 0, 3, 2, 0);
  const YC25 = new Card("25", 3, "white", 0, 0, 0, 0, 6);
  const YC26 = new Card("26", 2, "white", 0, 5, 0, 0, 0);
  const YC27 = new Card("27", 2, "white", 2, 4, 1, 0, 0);
  const YC28 = new Card("28", 2, "white", 3, 5, 0, 0, 0);
  const YC29 = new Card("29", 1, "white", 2, 2, 3, 0, 0);
  const YC30 = new Card("30", 1, "white", 0, 3, 0, 3, 2);
  activeDeck.splice(
    0,
    oldCards,
    YC01,
    YC02,
    YC03,
    YC04,
    YC05,
    YC06,
    YC07,
    YC08,
    YC09,
    YC10,
    YC11,
    YC12,
    YC13,
    YC14,
    YC15,
    YC16,
    YC17,
    YC18,
    YC19,
    YC20,
    YC21,
    YC22,
    YC23,
    YC24,
    YC25,
    YC26,
    YC27,
    YC28,
    YC29,
    YC30
  );
}

function freshGreenDeck(activeDeck, oldCards) {
  const GC01 = new Card("01", 1, "black", 0, 0, 0, 4, 0);
  const GC02 = new Card("02", 0, "black", 0, 1, 2, 0, 0);
  const GC03 = new Card("03", 0, "black", 0, 0, 3, 0, 0);
  const GC04 = new Card("04", 0, "black", 0, 1, 1, 1, 1);
  const GC05 = new Card("05", 0, "black", 0, 0, 2, 0, 2);
  const GC06 = new Card("06", 0, "black", 0, 1, 1, 2, 1);
  const GC07 = new Card("07", 0, "black", 0, 1, 0, 2, 2);
  const GC08 = new Card("08", 0, "black", 1, 3, 1, 0, 0);
  const GC09 = new Card("09", 1, "red", 0, 0, 0, 0, 4);
  const GC10 = new Card("10", 0, "red", 0, 0, 1, 2, 0);
  const GC11 = new Card("11", 0, "red", 0, 0, 0, 0, 3);
  const GC12 = new Card("12", 0, "red", 1, 0, 1, 1, 1);
  const GC13 = new Card("13", 0, "red", 0, 2, 0, 0, 2);
  const GC14 = new Card("14", 0, "red", 1, 0, 1, 1, 2);
  const GC15 = new Card("15", 0, "red", 2, 0, 1, 0, 2);
  const GC16 = new Card("16", 0, "red", 3, 1, 0, 0, 1);
  const GC17 = new Card("17", 1, "green", 4, 0, 0, 0, 0);
  const GC18 = new Card("18", 0, "green", 0, 0, 0, 1, 2);
  const GC19 = new Card("19", 0, "green", 0, 3, 0, 0, 0);
  const GC20 = new Card("20", 0, "green", 1, 1, 0, 1, 1);
  const GC21 = new Card("21", 0, "green", 0, 2, 0, 2, 0);
  const GC22 = new Card("22", 0, "green", 2, 1, 0, 1, 1);
  const GC23 = new Card("23", 0, "green", 2, 2, 0, 1, 0);
  const GC24 = new Card("24", 0, "green", 0, 0, 1, 3, 1);
  const GC25 = new Card("25", 1, "blue", 0, 4, 0, 0, 0);
  const GC26 = new Card("26", 0, "blue", 2, 0, 0, 0, 1);
  const GC27 = new Card("27", 0, "blue", 3, 0, 0, 0, 0);
  const GC28 = new Card("28", 0, "blue", 1, 1, 1, 0, 1);
  const GC29 = new Card("29", 0, "blue", 2, 0, 2, 0, 0);
  const GC30 = new Card("30", 0, "blue", 1, 2, 1, 0, 1);
  const GC31 = new Card("31", 0, "blue", 0, 2, 2, 0, 1);
  const GC32 = new Card("32", 0, "blue", 0, 1, 3, 1, 0);
  const GC33 = new Card("33", 1, "white", 0, 0, 4, 0, 0);
  const GC34 = new Card("34", 0, "white", 1, 2, 0, 0, 0);
  const GC35 = new Card("35", 0, "white", 0, 0, 0, 3, 0);
  const GC36 = new Card("36", 0, "white", 1, 1, 1, 1, 0);
  const GC37 = new Card("37", 0, "white", 2, 0, 0, 2, 0);
  const GC38 = new Card("38", 0, "white", 1, 1, 2, 1, 0);
  const GC39 = new Card("39", 0, "white", 1, 0, 2, 2, 0);
  const GC40 = new Card("40", 0, "white", 1, 0, 0, 1, 3);
  activeDeck.splice(
    0,
    oldCards,
    GC01,
    GC02,
    GC03,
    GC04,
    GC05,
    GC06,
    GC07,
    GC08,
    GC09,
    GC10,
    GC11,
    GC12,
    GC13,
    GC14,
    GC15,
    GC16,
    GC17,
    GC18,
    GC19,
    GC20,
    GC21,
    GC22,
    GC23,
    GC24,
    GC25,
    GC26,
    GC27,
    GC28,
    GC29,
    GC30,
    GC31,
    GC32,
    GC33,
    GC34,
    GC35,
    GC36,
    GC37,
    GC38,
    GC39,
    GC40
  );
}
