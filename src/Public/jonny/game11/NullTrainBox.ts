import "phaser";

export class NullTrainBox extends Phaser.GameObjects.Image{
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene, x, y, texture);
        this.setAlpha(0.2);
    }
}