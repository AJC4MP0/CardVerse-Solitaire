class Pile {
    constructor(type = 'layout') {
        this.type = type; // layout, foundation, waste
        this.cards = [];
    }

/*Adds card to top of the pile*/
    addCard(card) {
        this.cards.push(card);
    }
//Remove and return top card
    removeCard() {
        return this.cards.pop();
    }
//Peek top card
    topCard(){
        return this.cards[this.cards.length - 1];
    }
}