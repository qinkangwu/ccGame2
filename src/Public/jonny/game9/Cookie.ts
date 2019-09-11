import { ButtonContainer} from "../components";
import { NullCookie } from "./index";
import "phaser";

export class Cookie extends ButtonContainer{
    private image:Phaser.GameObjects.Image;
    private bitmapText:Phaser.GameObjects.BitmapText;
    public x:number;
    public y:number;
    public initPosition:{
        x:number,
        y:number
    }

    public delay:number;
    public hit:number;
    public nullCookie:NullCookie;
    public animate:Promise<number>;
    public tweenFunc:Phaser.Tweens.Tween;
    
    constructor(scene:Phaser.Scene,shape:any,callback: Phaser.Types.Input.HitAreaCallback,text:string,delay:number,x:number,y:number){
        super(scene,shape,callback);
        this.image = new Phaser.GameObjects.Image(this.scene, 0, 0, "cookie");
        this.bitmapText = new Phaser.GameObjects.BitmapText(this.scene, 0, 0 + 5, "GenJyuuGothic47", text, 35, 0).setOrigin(0.5);
        this.delay = delay;
        this.x = x;
        this.y = y;
        this.initPosition = {x:this.x,y:this.y};
        this.animate = new Promise((reslove)=>{
            this.tweenFunc = this.scene.add.tween(<Phaser.Types.Tweens.TimelineBuilderConfig>{
                targets: this,
                alpha: 1,
                y: this.initPosition.y,
                delay: 0,
                duration: 1000,
                paused:true,
                ease: 'Sine.easeOut',
                onComplete:()=>{
                    reslove(1);
                }
              })
        })
        this.add([this.image, this.bitmapText]);
    }


} 