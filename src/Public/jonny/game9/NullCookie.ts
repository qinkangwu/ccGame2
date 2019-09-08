import { Cookie } from "./index";
import "phaser";

export class NullCookie extends Phaser.GameObjects.Image {
    public collision:number = 0;
    public cookie:Cookie = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }
}