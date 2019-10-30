import "phaser";
import { Bounds } from "../core";

export class NullTrainBox extends Phaser.GameObjects.Image{
    //public hasBox:boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene, x, y, texture);
        this.setAlpha(0.1);
    }

    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }

}