import {Bounds} from "../core";
import "phaser";

export class TrackCircle extends Phaser.GameObjects.Image{
        public initPosition:Phaser.Math.Vector2;
        public targetPosition:Phaser.Math.Vector2;
       constructor(scene: Phaser.Scene,x: number, y: number, texture: string){
           super(scene,x,y,texture);
           this.initPosition = new Phaser.Math.Vector2(x,y);
           this.targetPosition = new Phaser.Math.Vector2(1024*3,y);
       } 

       animate(collisionFuc:Function,completeFuc:Function){
        this.scene.tweens.add({
            targets:this,
            duration:10000,
            x:this.targetPosition.x,
            onUpdate:()=>{
                collisionFuc();
            },
            onComplete:()=>{
                this.setPosition(
                    this.initPosition.x,
                    this.initPosition.y
                );
                completeFuc();
            }
          })
       }

       public syncBounds():Bounds{
        return new Bounds(this.getBounds());
        }
}
