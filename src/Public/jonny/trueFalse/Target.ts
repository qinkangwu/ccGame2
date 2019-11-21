import "phaser";

export class Target extends Phaser.GameObjects.Image {
    initY:number;
    constructor(scene: Phaser.Scene,x: number,y: number,texture:string){
        super(scene,x,y,texture);
        this.initY = y;
        this.setInteractive();
    }

    public init():Target{
        this.y+=100;
        this.scale = 0;
        return this;
    }

    public admission():Promise<number>{
        return new Promise(resolve => {
            this.scene.add.tween({
                targets:this,
                duration:200,
                scale:1,
                y:this.initY,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }
}

