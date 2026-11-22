class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('cards', '../images/cards.png', {
            frameWidth: 79, 
            frameHeight: 123,
            margin: 0, 
            spacing: 0
        });
    }

    /**
     * Initializes game objects, UI controls, deck state, input event listeners, 
     * and renders the initial board layout.
    */
    create() {
        const { width, height} = this.scale;

        // Top left Main Menu Button
        const menuBtn = this.add.text(40, 30, ' ◀ Main Menu ', {
            fontFamily: 'Oswald, sans-serif',
            fontSize: '16px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setColor('#48cae4'));
        menuBtn.on('pointerout', () => menuBtn.setColor('#ffffff'));
        menuBtn.on('pointerdown', () => {
            this.scene.start("MainMenuScene");
        });

        //Initalize and shuffle deck
        const deck = new Deck();
        deck.shuffle();

        //Create the 7 layout slots
        this.layoutPiles = [];
        const layoutStartX = 180;
        const layoutSpacing = 75;
        const startY = 220

        for (let i = 0; i < 7; i++) {
            const pile = new Pile('layout');
            for (let j = 0; j <= i; j++) {
                const card = deck.dealCard();

                //if this card is the top most card, flip
                if (j == i) {
                    card.flip();
                }

                pile.addCard(card);
            }

            this.layoutPiles.push(pile);
        }

        // ------------ FOUNDATION PILES ------------
        //Create 4 foundation piles
        this.foundationPiles = [];
        const foundStartX = 405;
        const foundStartY = 100;
        const foundSpacing = 75;

        for(let i = 0; i < 4; i++) {
            const pile = new Pile('foundation');
            const x = foundStartX + (i * foundSpacing);

            // drop zone for foundation slot
            const dropZone = this.add.zone(x, foundStartY, 65, 95)
                .setRectangleDropZone(65, 95)
                .setOrigin(0.5);

            dropZone.pileReference = pile;
            dropZone.isFoundation = true;

            this.foundationPiles.push(pile);
        }

        //renders cards on screen
        this.renderLayout(layoutStartX, startY, layoutSpacing);

        // ------------ STOCK / WASTE PILES ------------

        // Initialize Stock and Waste piles
        this.stockPile = new Pile('stock');
        this.wastePile = new Pile('waste');

        // All remaining cards into stock pile, faced down
        while (deck.cards.length > 0) {
            const card =  deck.dealCard();
            this.stockPile.addCard(card);
        }

        // Stock Pile Click Interaction (Draws card or recycles waste)
        const stockX = 180;
        const stockY = 100;
        const cardWidth = 65;
        const cardHeight = 95;

        const stockBg = this.add.rectangle(stockX, stockY, cardWidth, cardHeight, 0xd9534f)
            .setStrokeStyle(1, 0x333333)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        stockBg.on('pointerdown', () => {
            if (this.stockPile.cards.length > 0) {
                // Draw card from stock to waste
                const card = this.stockPile.cards.pop();
                card.faceUp = true;
                this.wastePile.addCard(card);
            } else {
                // Recycle waste pile back into stock pile
                while (this.wastePile.cards.length > 0) {
                    const card = this.wastePile.cards.pop();
                    card.faceUp = false;
                    this.stockPile.addCard(card);
                }
            }
            this.refreshBoard();
        });

                // ------------- DRAG HANDLER -------------
        //Brings the dragged card container to the front
        this.input.on('dragstart', (pointer, gameObject) => {
            //Bring dragged card to very top layer so it floats above the others
            this.children.bringToTop(gameObject);
            gameObject.alpha = 0.85; // adds transparency when dragging
        });

        // Smoothly updates card container position with the mouse cursor
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            //Move the container smoothly with the cursor
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        //Restores full opacity and snaps back if dropped outside valid zones
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            gameObject.alpha = 1.0
            
            //When dropped without valid drop zone, goes back to home
            if(!dropped) {
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });

        // ------------- DROP HANDLER -------------
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            const draggedCard = gameObject.cardData;
            const targetPile = dropZone.pileReference;
            const sourcePile = gameObject.sourcePile;

            let isValid = false;

            if (dropZone.isFoundation){
                //check foundation rules (ascending suit)
                isValid = this.isValidFoundationMove(draggedCard, targetPile);
            } else {
                //check layout rules (different pile, alt colors, descending rank)
               /* isValid = (sourcePile !== targetPile && this.isValidFoundationMove(draggedCard, targetPile)); */
                isValid = (sourcePile !== targetPile && this.isValidLayoutMove(draggedCard, targetPile));
            }

            if (isValid) {
                console.log(`Valid move: Dropped ${draggedCard.value} of ${draggedCard.suit}`);

                 //remove card from source pile
                gameObject.sourcePile.removeCard(draggedCard);
                
                //If source was a layout pile, auto flip the new top card face-up
                if (gameObject.sourcePile.type === 'layout' && gameObject.sourcePile.cards.length > 0) {
                    const newTopCard = gameObject.sourcePile.cards[gameObject.sourcePile.cards.length - 1];
                    if(!newTopCard.faceUp) {
                        newTopCard.flip();
                    }
                }
                //add card to target pile
                targetPile.addCard(draggedCard);

                //clear old visuals and re render board with updated version
                this.refreshBoard();
            } else {
                //invalid move
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });

    } // create 

    /*
     * Renders the 7 layout columns, drop zones, and individual card graphics/containers.
     */
    renderLayout(startX, startY, spacing) {
        const cardWidth = 65;
        const cardHeight = 95;
        //How far a card is from the next
        const verticalSpacing = 30;

        this.layoutPiles.forEach((pile, colIndex) => {
            const x = startX + (colIndex * spacing);

            //Active drop zone
            const zoneHeight = cardHeight + (Math.max(0, pile.cards.length - 1) * verticalSpacing);
            const dropZone = this.add.zone(x, startY + (zoneHeight / 2) - (cardHeight / 2), cardWidth, zoneHeight)
                .setRectangleDropZone(cardWidth, zoneHeight)
                .setOrigin(0.5);
            
            //Pile reference to the drop zone
            dropZone.pileReference = pile;
            
            //Draw empty layout slot outline
            this.add.rectangle(x, startY, cardWidth, cardHeight, 0xffffff)
                .setStrokeStyle(1, 0x333333, 0.3)
                .setOrigin(0.5);

            pile.cards.forEach((card, cardIndex) => {
                const y = startY + (cardIndex * verticalSpacing);

                if(card.faceUp) {
                    const frameIndex = this.getCardFrame(card);
                    const cardSprite = this.add.sprite(0, 0, 'cards', frameIndex)
                        .setDisplaySize(cardWidth, cardHeight)
                        .setOrigin(0.5);
                    
                    //Card container for dragging
                    const cardContainer = this.add.container(x, y, [cardSprite])
                        .setSize(cardWidth, cardHeight)
                        .setInteractive({ useHandCursor: true});

                    // references for what card/pile the card belongs to
                    cardContainer.cardData = card;
                    cardContainer.sourcePile = pile;
                    cardContainer.originalX = x;
                    cardContainer.originalY = y;
                    
                //Phaser drag input
                    this.input.setDraggable(cardContainer);
                } else {
                    this.add.sprite(x , y, 'cards', 55)
                    .setDisplaySize(cardWidth, cardHeight)
                    .setOrigin(0.5);
                }
            });
        });

    } // render method

    /*
    * Clears out game objects from the screen and redraws both the layout columns and top foundation piles.
    */
    refreshBoard() {
        // Clear out existing dynamic card/slot game objects
        this.children.list
            .filter(child => child.type === 'Container' || child.type === 'Rectangle' || child.type === 'Text' || child.type === 'Zone' || child.type === 'Sprite')
            .forEach(child => child.destroy());

        // Re-render layout columns and drop zones
        this.renderLayout(180, 220, 75);

        // ----------- Render Stock Pile ----------- 
        const stockX = 180;
        const stockY = 100;
        const cardWidth = 65;
        const cardHeight = 95;

        const stockBg = this.add.rectangle(stockX, stockY, cardWidth, cardHeight, 0xd9534f)
            .setStrokeStyle(1, 0x333333)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        stockBg.on('pointerdown', () => {
            if (this.stockPile.cards.length > 0) {
                const card = this.stockPile.cards.pop();
                card.faceUp = true;
                this.wastePile.addCard(card);
            } else {
                while (this.wastePile.cards.length > 0) {
                    const card = this.wastePile.cards.pop();
                    card.faceUp = false;
                    this.stockPile.addCard(card);
                }
            }
            this.refreshBoard();
        });

        this.add.text(stockX, stockY, `STOCK\n(${this.stockPile.cards.length})`, {
            fontFamily: 'Oswald, Arial, sans-serif',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // ----------- Render Waste Pile ----------- 
        const wasteX = 255;
        const wasteY = 100;

        this.add.rectangle(wasteX, wasteY, cardWidth, cardHeight)
            .setStrokeStyle(1, 0xffffff, 0.4)
            .setOrigin(0.5);

        if (this.wastePile.cards.length > 0) {
            const topWasteCard = this.wastePile.cards[this.wastePile.cards.length - 1];
            const frameIndex = this.getCardFrame(topWasteCard);
            
            const cardSprite = this.add.sprite(0, 0, 'cards', frameIndex)
                .setDisplaySize(cardWidth, cardHeight)
                .setOrigin(0.5);
            
            const cardContainer = this.add.container(wasteX, wasteY, [cardSprite])
                .setSize(cardWidth, cardHeight)
                .setInteractive({ useHandCursor: true });
            
            cardContainer.cardData = topWasteCard;
            cardContainer.sourcePile = this.wastePile;
            cardContainer.originalX = wasteX;
            cardContainer.originalY = wasteY;

            this.input.setDraggable(cardContainer);
        }

        // Re-render foundation piles
        const foundStartX = 405;
        const foundStartY = 100;
        const foundSpacing = 75;

        this.foundationPiles.forEach((pile, i) => {
            const x = foundStartX + (i * foundSpacing);

            // 1. Drop zone for foundation slot
            const dropZone = this.add.zone(x, foundStartY, 65, 95)
                .setRectangleDropZone(65, 95)
                .setOrigin(0.5);

            dropZone.pileReference = pile;
            dropZone.isFoundation = true;

            // 2. Draw placeholder outline for foundation slot
            this.add.rectangle(x, foundStartY, 65, 95)
                .setStrokeStyle(1, 0xffffff, 0.4)
                .setOrigin(0.5);

            // 3. Draw top card of foundation if any exist
            if (pile.cards.length > 0) {
                const topCard = pile.cards[pile.cards.length - 1];
                const frameIndex = this.getCardFrame(topCard);
                
                this.add.sprite(x, foundStartY, 'cards', frameIndex)
                    .setDisplaySize(cardWidth, cardHeight)
                    .setOrigin(0.5);
            }
        });
    } // refresh

    /*
    * Returns the corresponding suit symbol for a given suit string.
    */
    getSuitSymbol(suit) {
        switch(suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    }

    /*
    * Validates moves between layout columns (descending rank, alternating colors, Kings on empty slots).
    */
    isValidLayoutMove(card, targetPile) {
        //Rule 1: empty column only uses King
        if (targetPile.cards.length === 0) { // three '=' means that cards.length has to be 0, same type and value  
            return card.value === 'K';       // if two '=' any card can be placed
        }

        const topCard = targetPile.topCard();

        //Rule 2: Must be descending rank from the previous card
        const rankValues = {'A': 1,   '2': 2,   '3': 3,   '4': 4, 
                            '5': 5,   '6': 6,   '7': 7,   '8': 8, '9': 9, 
                            '10': 10, 'J': 11,  'Q': 12,  'K': 13
                            };
        const cardRank = rankValues[card.value];
        const topRank = rankValues[topCard.value];
        const isDescending = cardRank === topRank - 1;

        //Rule 3: Must be alternating colors
        const isCardRed = (card.suit === 'hearts' || card.suit === 'diamonds');
        const isTopRed =  (topCard.suit === 'hearts' || topCard.suit === 'diamonds');
        const isAlternatingColor = isCardRed !== isTopRed;

        return isDescending && isAlternatingColor;
    }

    /*
    * Validates moves into foundation piles (must start with Ace, match suit, and build up sequentially).
    */
    isValidFoundationMove(card, targetPile){
        //Rule 1: Empty foundation pile can only have Ace
        if (targetPile.cards.length === 0) {
            return card.value === 'A';
        }

        const topCard = targetPile.topCard();

        //Rule 2: Must be the exact same suit
        if (card.suit !== topCard.suit) {
            return false;
        }

        //Rule 3: Must be ascending rank
        const rankValues = {'A': 1,   '2': 2,   '3': 3,   '4': 4, 
                            '5': 5,   '6': 6,   '7': 7,   '8': 8, '9': 9, 
                            '10': 10, 'J': 11,  'Q': 12,  'K': 13
                            };
        
        return rankValues[card.value] === rankValues[topCard.value] + 1;
    }

    getCardFrame(card) {
    const rankMap = {
        'A': 0, '2': 1, '3': 2, '4': 3, '5': 4,
        '6': 5, '7': 6, '8': 7, '9': 8, '10': 9,
        'J': 10, 'Q': 11, 'K': 12
    };

    const suitRowMap = {
        'clubs': 0,
        'diamonds': 1,
        'hearts': 2,
        'spades': 3
    };

    const row = suitRowMap[card.suit] !== undefined ? suitRowMap[card.suit] : 0;
    const rankIndex = rankMap[card.value] !== undefined ? rankMap[card.value] : 0;

    return (row * 13) + rankIndex;
}
} //class