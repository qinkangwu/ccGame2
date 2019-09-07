import { Cookie } from "./index";
import "phaser";

export class NullCookie extends Phaser.GameObjects.Image {
    public collision:number;
    public cookie:Cookie;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }
}