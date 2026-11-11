//Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2, 'Main Game Screen Active!', {
            fontSize: '28px',
            color: '#00ffcc'
        }).setOrigin(0.5);
    }
}

//Game Configuration & Initialization
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0f0c20',
    scene: [MainMenuScene, GameScene]
};

const game = new Phaser.Game(config);