import "phaser";
import {Gold} from "./Gold";

interface Config{
    texture?:string;   //纹理,默认为 assets/commonUI/gold.png，须先载入纹理，
    callback?:Function;  //动画结束的回调函数，可选
}

/**
 * src/Public/jonny/components/SellingGold.ts
 * @parame parentScene: Phaser.Scene; 
 * @parame config?:{
 * texture:string,  默认为 assets/commonUI/gold.png，须先载入纹理,否则需要重新传递此参数 | 可选
 * callback:Phaser.Types.Tweens.TweenOnCompleteCallback    动画结束的回调函数 | 可选
 * } 
 */

export class SellingGold{
    private parentScene:Phaser.Scene;
    private glodValue:number;
    private golds:Phaser.GameObjects.Container;
    private texture:string;
    private callback:Function;
    private count:number = 0;

    constructor(parentScene:Phaser.Scene,config?:Config){
        this.parentScene = parentScene;
        this.glodValue = 3;
        this.callback = config.callback || function (){};
        this.texture = config.texture || "gold";
    }

    /**
     *  正确
     */
    public goodJob() {
        this.golds = this.parentScene.add.container(0,0);
        let _gold:Phaser.GameObjects.Image;
        for(let i = 0;i < this.glodValue;i++){
            if(i===0){
                _gold = this.createGlod().setPosition(400,276).setScale(0);
                this.golds.add(_gold);    //左
                this.goldAni(_gold,900);
            }
            if(i===1){
                _gold = this.createGlod().setPosition(624,276).setScale(0);
                this.golds.add(_gold);    //右
                this.goldAni(_gold,300);
            }
            if(i===2){
                _gold = this.createGlod().setPosition(512,276).setScale(0);
                this.golds.add(_gold);    //上
                this.goldAni(_gold,600);
            }
        }
    }

    private createGlod():Phaser.GameObjects.Image{
        let glod = this.parentScene.add.image(0,0,this.texture);
        return glod;
    }

    private goldAni(glod,delay:number=0):void{
        let that = this;
        let factor = 0.45;
        var spring = function (t){
            return Math.pow(2, -10 * t) * Math.sin((t - factor / 4) * (2 * Math.PI) / factor) + 1;
        }

        var onCompleteHandler = ()=>{
            this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:glod,
                x:Gold.imgPosition.x,
                y:Gold.imgPosition.y,
                delay:delay,
                ease:"Sine.easeOut",
                duration:500,
                onComplete:()=>{
                    this.parentScene.tweens.add({
                        targets:glod,
                        delay:150,
                        alpha:0,
                        duration:300,
                        onComplete:()=>{
                            glod.destroy();
                            this.count+=1;
                            if(this.count===this.glodValue-1){
                                this.count=0;
                                this.callback(); 
                            }
                        }
                    })
                }
            })


        }

        this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:glod,
            scale:1,
            ease:spring,
            duration:800,
            onComplete:onCompleteHandler
        })

        //setTimeout(this.callback,2500);

    }

    public static loadImg(scene:Phaser.Scene):void{
        scene.load.image("gold","assets/commonUI/gold.png");
    }

}
