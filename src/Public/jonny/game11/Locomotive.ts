import "phaser";

export class Locomotive extends Phaser.GameObjects.Image{
    public body: Phaser.Physics.Arcade.Body;
    pitStop:Phaser.Tweens.Timeline;
    constructor(scene: Phaser.Scene, x: number=0, y: number=0, texture: string="locomotive"){
        super(scene,x,y,texture);
        this.init();
        this.pitStop = this.scene.tweens.timeline({
            targets:this,
            paused:true,
            repeat:-1,
            yoyo:true,
            tweens:[
                {
                    scaleX:0.98,
                    scaleY:1,
                    duration:250,
                    ease:"Sine.easeOut"
                }
            ]    
        })
    }

    init(){
        this.setScale(1,0.98);
        this.setOrigin(0.5,1);
        //this.setPosition(1167.75,93.7);
    }

    public admission():Promise<any>{
        let animate = {
            then:resolve=>{
                this.scene.add.tween({
                    targets:this,
                    duration:5000,
                    ease:"Sine.easeOut",
                    x:0,
                    onStart:()=>{
                       this.pitStop.play(); 
                    },
                    onComplete:()=>{
                       resolve("ok");
                    }
                })
            }
        }
        return Promise.resolve(animate);
    }

    public static loadImg(scene:Phaser.Scene){
        scene.load.image("locomotive","assets/Game11/locomotive.png");
    }




}