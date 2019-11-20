import "phaser";

export class TrueTarget extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene,x: number,y: number){
        super(scene,x,y,"bg_t");
        this.setInteractive();
    }
}

export class FalseTarget extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene,x: number,y: number){
        super(scene,x,y,"bg_f");
        this.setInteractive();
    }
}