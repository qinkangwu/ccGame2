import "phaser";

export class CivaWorker extends Phaser.GameObjects.Sprite{
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, animationConfig:Phaser.Types.Animations.Animation=null){
        super(scene,x,y,texture);
        if(animationConfig!==null){
            this.scene.anims.create(animationConfig);
        }
    }

    public flight():void{

    }
}