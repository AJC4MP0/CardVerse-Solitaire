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