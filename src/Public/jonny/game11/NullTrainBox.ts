import "phaser";
import { TrainBox } from "./Trainbox";
import { Bounds } from "../core";

export class NullTrainBox extends Phaser.GameObjects.Image{
    public trainbox:TrainBox = null;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene, x, y, texture);
        this.setAlpha(0.2);
    }

    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }

}