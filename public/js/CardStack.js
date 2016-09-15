function CardStack() {
    this._stack = [];
    this._playedCards = {};
    this.shift = function() {
        return this._stack.shift();
    }
    this.push = function(card) {
        return this._stack.push(card);
    }
    this.length = function() {
        return this._stack.length;
    }
    this.markAsPlayed = function(card) {
        this._playedCards[card._id] = card;
    }
    this.getPlayedCardIds = function() {
        if(Object.keys(this._playedCards).length==0)
          return "0";
        return Object.keys(this._playedCards).join(",");
    }
    this.getExcludedCardIds = function(){
      var excludes = Object.keys(this._playedCards);
      excludes.push("0");
      for (card of this._stack) {
          excludes.push(card._id);
      }
      return excludes;
    }
    this.isCardAlreadyPlayed = function(card) {
        return (typeof(this._playedCards[card._id]) != "undefined")
    }

}
