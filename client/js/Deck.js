class Deck {
    constructor() {
        this.cards = [];
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.initialize();
    }
/* Generates 52 card deck*/
    initialize() {
        for (let suit of this.suits) {
            for(let value of this.values) {
                this.cards.push(new Card(suit, value));
            }
        }
    }
/* Fisher-Yates Shuffle: Picks random card from unshuffled deck, moves to back of shuffled deck,*/
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this. cards[j]] = [this.cards[j], this.cards [i]];
        }
    }
/* Draw/Deal a single card from top of deck */
    dealCard() {
        return this.cards.pop();
    }
}