import "phaser";
/**
 * @parame parentScene: Phaser.Scene; 
 * @parame config; 可选
 */

interface Config{
    texture?:string;   //纹理,默认为 assets/commonUI/gold.png，须先载入纹理，
    callback?:Phaser.Types.Tweens.TweenOnCompleteCallback;  //动画结束的回调函数，可选
}

export class TipsParticlesEmitterCallback {
    private parentScene:Phaser.Scene;
    private glodValue:number;
    private golds:Phaser.GameObjects.Container;
    private texture:string;
    private callback:Phaser.Types.Tweens.TweenOnCompleteCallback;

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
                _gold = this.createGlod(465.15,188.5);
                this.golds.add(_gold);    //左
                this.goldAni(_gold,405.8,277.3,1,1,900);
            }
            if(i===1){
                _gold = this.createGlod(567.65,188.5);
                this.golds.add(_gold);    //右
                this.goldAni(_gold,619.85,277.3,1,1,300);
            }
            if(i===2){
                _gold = this.createGlod(517.35,174.5);
                this.golds.add(_gold);    //上
                this.goldAni(_gold,512.6,277.3,1,1,600);
            }
        }
    }

    private createGlod(x: number, y: number):Phaser.GameObjects.Image{
        let glod = this.parentScene.add.image(x,y,this.texture).setScale(0);
        return glod;
    }

    private goldAni(glod,x:number,y:number,scale:number,alpha:number=1,delay:number=0):void{
        let that = this;
        let factor = 0.45;
        var spring = function (t){
            return Math.pow(2, -10 * t) * Math.sin((t - factor / 4) * (2 * Math.PI) / factor) + 1;
        }

        var onCompleteHandler = ()=>{
            this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:glod,
                x:968.95,
                y:149.75,
                delay:delay,
                ease:"Linear",
                duration:500,
                onComplete:()=>{
                    this.parentScene.tweens.add({
                        targets:glod,
                        delay:150,
                        alpha:0,
                        duration:300,
                        onComplete:()=>{
                            glod.destroy();
                        }
                    })
                }
            })


        }

        this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:glod,
            x:x,
            y:y,
            ease:"Sine.easeInOut",
            duration:600
        })

        this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:glod,
            scale:scale,
            ease:spring,
            duration:800,
            onComplete:onCompleteHandler
        })

        setTimeout(this.callback,2500);

    }

}
