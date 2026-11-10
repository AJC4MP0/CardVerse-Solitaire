export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super ({ key: 'MainMenuScene' });
    }

    //preloads images or audio
    preload() {
        
    }

    create() {
        const { width, height} = this.scale;
        //background
        this.add.rectangle( 0, 0, width, height, 0x1a1a2e).setOrigin(0);

        //Game title
        this.add.text(width / 2, height * 0.25, 'CARDVERSE SOLITAIRE',{
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        //Create Interactive Menu Buttons
        this.createButton(width/2, height * 0.5, 'Play Game', () => {
            this.scene.start('GameScene');
        });

        this.createButton(width/2, height * 0.6, 'Options', () => {
            console.log('Options clicked');
        });

        this.createButton(width/2, height * 0.7, 'Log Out', () => {
            window.location.href = '/login.html';
        });
    }

    createButton(x, y, textLabel, onClick) {
        const buttonWidth = 220;
        const buttonHeight = 50;

        // Container to group the rectangle background and text label
        const container = this.add.container(x, y);

        // Button background shape
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x0f3460)
            .setInteractive({ useHandCursor: true });

        // Button text
        const text = this.add.text(0, 0, textLabel, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#48cae4'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // Hover & click events
        bg.on('pointerover', () => {
            bg.setFillStyle(0x16213e);
            text.setColor('#ffffff');
            container.setScale(1.05);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x0f3460);
            text.setColor('#48cae4');
            container.setScale(1.0);
        });

        bg.on('pointerdown', onClick);

        return container;
    }

}