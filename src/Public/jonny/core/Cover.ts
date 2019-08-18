import "phaser";

/**
 * @param scene is Phaser.Scene
 * @param texture is string
 */

export default class Cover extends Phaser.GameObjects.Container{
    constructor(scene,texture) {
        super(scene);
        this.init(scene,texture);
    }

    init(scene,texture){
        let _bg = new Phaser.GameObjects.Graphics(scene);
        _bg.fillStyle(0x000000);
        _bg.fillRect(0, 0, scene.game.renderer.width, scene.game.renderer.height);
        _bg.setAlpha(0.6);
        let _cover = new Phaser.GameObjects.Image(scene, scene.game.renderer.width * 0.5, scene.game.renderer.height * 0.5, texture).setOrigin(0.5);
        this.add([_bg,_cover]);
        this.setDepth(100);
        this.bindClick(_cover);
    }

    bindClick(_cover){
        _cover.setInteractive();
        _cover.on("pointerdown",()=>{
            this.destroy();
        })
    }
}