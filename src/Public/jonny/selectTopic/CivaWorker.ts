import "phaser";

export class CivaWorker extends Phaser.GameObjects.Sprite{
    private time:number = 0;
    public asBeeDanceAnimate:Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string,frame?: string){
        super(scene,x,y,texture,frame);
    }

    public asBee():CivaWorker{
        this.scene.anims.create({
         key:"flight",
         frames:this.scene.anims.generateFrameNames("civaBee",{prefix:"civaBee000",start:0,end:9}),
         repeat:-1,
         frameRate:60
       });
       this.play("flight");
       return this;
    }

    public asBeeDance(){
        this.asBeeDanceAnimate = this.scene.add.tween({
            targets:this,
            y:"+=10",
            repeat:-1,
            duration:500,
            yoyo:true,
            onUpdate:()=>{
                this.time+=0.2;
                this.x += Math.sin(this.time);
            }
        });
    }

    public asBeeWorking(x:number,y:number):Promise<boolean>{
        this.asBeeDanceAnimate.stop();
        return new Promise<boolean>(resolve=>{
            this.scene.tweens.timeline({
                targets:this,
                tweens:[
                    {
                        x:x,
                        y:y,
                        duration:1500,
                        onUpdate:()=>{
                            this.time+=0.1;
                            this.x += Math.sin(this.time)*10; 
                        }
                    }
                ],
                onComplete:()=>{
                    this.anims.stop();
                    resolve(true);
                }
            })
        });

    }
}