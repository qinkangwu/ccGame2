import "phaser";
import { Vec2 } from "../core";
 
export class CivaMen extends Phaser.GameObjects.Image{
    targetPosition:Vec2;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene,x,y,texture);
        this.targetPosition = new Vec2(x,y);
    }

    public asArcherInit(){
        this.x = -233;
    }


    public asArcherAdmission():Promise<number>{
        return new Promise(resolve => {
            this.scene.add.tween({
                targets:this,
                x:this.targetPosition.x,
                y:this.targetPosition.y,
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }
}