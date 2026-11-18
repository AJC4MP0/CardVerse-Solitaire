class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        /*this.load.spritesheet('cards', '.../images/OIUGSZ0.jpg', {
          //  frameWidth: 64, 
          //  frameHeight: 96 
        });*/
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

        this.refreshBoard();

        //renders cards on screen
        this.renderLayout(layoutStartX, startY, layoutSpacing);

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

            let isValid = false;

            if (dropZone.isFoundation){
                //check foundation rules (ascending suit)
                isValid = this.isValidFoundationMove(draggedCard, targetPile);
            } else {
                //check layout rules (different pile, alt colors, descending rank)
                isValid = (gameObject.sourcePile !== targetPile && this.isValidLayoutMove(draggedCard, targetPile));
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

                //empty layout slot outline
                const cardBgColor = card.faceUp ? 0xffffff : 0xd9534f;
                this.add.rectangle(x, y, cardWidth, cardHeight, cardBgColor)
                    .setStrokeStyle(1, 0x000000)
                    .setOrigin(0.5);

                if(card.faceUp) {
                // container for face up card
                    const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff)
                        .setStrokeStyle(1, 0x333333)
                        .setOrigin(0.5);
                    
                //Changes colors: If hearts or diamonds, the card will be red, vice versa
                    const textColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? '#cd4945' : '#000000';
                    // Creates the card: Card value (upper line), suit (lower line)
                    const cardText = this.add.text(0, 0, `${card.value}\n${this.getSuitSymbol(card.suit)}`, {
                        fontFamily: 'Oswald, Arial, sans-serif',
                        fontSize: '14px',
                        fontStyle: 'bold',
                        color: textColor,
                        align: 'center'
                    }).setOrigin(0.5);
                    
                //Card container
                    const cardContainer = this.add.container(x, y, [cardBg, cardText])
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
                    this.add.rectangle(x , y, cardWidth, cardHeight, 0xcd4945)
                    .setStrokeStyle(1, 0x333333)
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
            .filter(child => child.type === 'Container' || child.type === 'Rectangle' || child.type === 'Text' || child.type === 'Zone')
            .forEach(child => child.destroy());

        // Re-render layout columns and drop zones
        this.renderLayout(180, 220, 75);

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
                
                this.add.rectangle(x, foundStartY, 65, 95, 0xffffff)
                    .setStrokeStyle(1, 0x333333)
                    .setOrigin(0.5);
                
                const textColor = (topCard.suit === 'hearts' || topCard.suit === 'diamonds') ? '#cd4945' : '#000000';
                this.add.text(x, foundStartY, `${topCard.value}\n${this.getSuitSymbol(topCard.suit)}`, {
                    fontFamily: 'Oswald, Arial, sans-serif',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    color: textColor,
                    align: 'center'
                }).setOrigin(0.5);
            }
        });
    }

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
} //class