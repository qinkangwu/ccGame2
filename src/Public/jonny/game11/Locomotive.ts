import "phaser";

export class Locomotive extends Phaser.GameObjects.Image{
    pitStop:Phaser.Tweens.Timeline;
    /**
     * 注册点为 (0.5,1);
     */
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
        this.setPosition(1167.75,280);
    }

    public admission():void{
        this.scene.add.tween({
            targets:this,
            duration:5000,
            ease:"Sine.easeOut",
            x:180,
            onStart:()=>{
               this.pitStop.play(); 
            },
            onComplete:()=>{
                //this.pitStop.play();
            }
        })
    }

    public static loadImg(scene:Phaser.Scene){
        scene.load.image("locomotive","assets/Game11/locomotive.png");
    }




}