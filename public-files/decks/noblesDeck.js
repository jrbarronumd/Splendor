export default class NoblesDeck {
   constructor(nobles = freshNoblesDeck()) {
      this.nobles = nobles;
   }

   shuffle() {
      /*Goes through the deck one card at a time starting at the bottom and swaps the card with a random card in the deck
      came from WebDevSimplified card game video*/
      for (let i = 9; i > 0; i--) {
         const newIndex = Math.floor(Math.random() * (i + 1));
         const oldValue = this.nobles[newIndex];
         this.nobles[newIndex] = this.nobles[i];
         this.nobles[i] = oldValue;
      }
   }
}

class Noble {
   constructor(nobleId, blackVal, redVal, greenVal, blueVal, whiteVal) {
      this.nobleId = nobleId;
      this.blackVal = blackVal;
      this.redVal = redVal;
      this.greenVal = greenVal;
      this.blueVal = blueVal;
      this.whiteVal = whiteVal;
   }
}

function freshNoblesDeck() {
   const N01 = new Noble("01", 3, 3, 3, 0, 0);
   const N02 = new Noble("02", 3, 0, 0, 3, 3);
   const N03 = new Noble("03", 0, 4, 4, 0, 0);
   const N04 = new Noble("04", 4, 0, 0, 0, 4);
   const N05 = new Noble("05", 0, 0, 3, 3, 3);
   const N06 = new Noble("06", 0, 0, 4, 4, 0);
   const N07 = new Noble("07", 3, 3, 0, 0, 3);
   const N08 = new Noble("08", 0, 0, 0, 4, 4);
   const N09 = new Noble("09", 4, 4, 0, 0, 0);
   const N10 = new Noble("10", 0, 3, 3, 3, 0);
   return [N01, N02, N03, N04, N05, N06, N07, N08, N09, N10];
}
