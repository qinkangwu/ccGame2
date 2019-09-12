import {Bounds} from "../core";
import { Cookie } from "./index";
import "phaser";



export class NullCookie extends Phaser.GameObjects.Image {
    public collision:number = 0;
    public cookie:Cookie = null;
    public bounds:Bounds;
    public initPosition:{
        x:number;
        y:number;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.initPosition = {
            x:this.x,
            y:this.y
        }
    }

    public syncBounds():Bounds{
        return new Bounds(new Phaser.Geom.Rectangle(
            (<Phaser.Physics.Arcade.Body>this.body).x,
            (<Phaser.Physics.Arcade.Body>this.body).y,
            (<Phaser.Physics.Arcade.Body>this.body).width,
            (<Phaser.Physics.Arcade.Body>this.body).height
        ));
    }
}