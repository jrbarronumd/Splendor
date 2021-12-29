export default class NoblesDeck {
   constructor(nobles = freshNoblesDeck()) {
      this.nobles = nobles;
   }
}

class Noble {
   constructor(nobleValue, blackValue, redValue, greenValue, blueValue, whiteValue) {
      this.nobleValue = nobleValue;
      this.blackValue = blackValue;
      this.redValue = redValue;
      this.greenValue = greenValue;
      this.blueValue = blueValue;
      this.whiteValue = whiteValue;
   }
}

function freshNoblesDeck() {
   new Noble(3, 3, 3, 3, 0, 0);
   new Noble(3, 3, 0, 0, 3, 3);
}
