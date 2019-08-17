class Cover extends Phaser.GameObjects.Container{
    constructor(scene:Phaser.Scene,coverTexture:string){
        super(scene);
        this.createElement(scene,coverTexture);
    }

    createElement(scene:Phaser.Scene,coverTexture:string){
        let bg = new Phaser.GameObjects.Graphics(scene);
        bg.fillStyle(0x000000).setAlpha(0.6);
        let cover = new Phaser.GameObjects.Image(scene,0, 0,coverTexture).setOrigin(0.5);
        cover.setPosition(
            scene.game.renderer.width*0.5,
            scene.game.renderer.width*0.5
        );
        this.add([bg,cover])
    }
}