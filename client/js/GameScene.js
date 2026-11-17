class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('cards', '.../images/OIUGSZ0.jpg', {
            frameWidth: 64, 
            frameHeight: 96 
        });
    }

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

        //renders cards on screen
        this.renderLayout(layoutStartX, startY, layoutSpacing);

    } // create 

    renderLayout(startX, startY, spacing) {
        const cardWidth = 65;
        const cardHeight = 95;
        //How far a card is from the next
        const verticalOffset = 30;

        this.layoutPiles.forEach((pile, colIndex) => {
            const x = startX + (colIndex * spacing);

            this.add.rectangle(x, startY, cardWidth, cardHeight)
            .setStrokeStyle(1, 0xffffff, 0.3)
            .setOrigin(0.5);

            pile.cards.forEach((card, cardIndex) => {
                const y = startY + (cardIndex * verticalOffset);

                const cardBgColor = card.faceUp ? 0xffffff : 0xd9534f;
                this.add.rectangle(x, y, cardWidth, cardHeight, cardBgColor)
                    .setStrokeStyle(1, 0x000000)
                    .setOrigin(0.5);

                if(card.faceUp) {
                    //red cards
                    const textColor = (card.suit == 'hearts' || card.suit == 'diamonds') ? '#cd4945' :'#000000';
                    this.add.text(x, y, `${card.value}\n${this.getSuitSymbol(card.suit)}`, {
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '14px',
                        fontStyle: 'bold',
                        color: textColor,
                        align: 'center'
                    }).setOrigin(0.5);
                }
            });
        });

    } // render method

    getSuitSymbol(suit) {
        switch(suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    }
} //class