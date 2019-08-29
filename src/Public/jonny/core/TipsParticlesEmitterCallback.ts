import "phaser";
/**
 * @parame parentScene: Phaser.Scene; 传入场景
 */

export class TipsParticlesEmitterCallback {
    public parentScene:Phaser.Scene;
    private glodValue:number;
    private golds:Phaser.GameObjects.Container;

    constructor(parentScene:Phaser.Scene) {
        this.parentScene = parentScene;
        this.glodValue = 3;
    }

    /**
     *  正确
     */
    public goodJob() {
        this.golds = this.parentScene.add.container(0,0);
        let _gold:Phaser.GameObjects.Image;
        for(let i = 0;i < this.glodValue;i++){
            if(i===0){
                _gold = this.createGlod(465.15,188.5,63,63);
                this.golds.add(_gold);    //左
                this.goldAni(_gold,405.8,277.3,76/63,500,1,0);
            }
            if(i===1){
                _gold = this.createGlod(567.65,188.5,63,63);
                this.golds.add(_gold);    //右
                this.goldAni(_gold,619.85,277.3,76/63,500,1,0);
            }
            if(i===2){
                _gold = this.createGlod(517.35,174.5,63,63);
                this.golds.add(_gold);    //上
                this.goldAni(_gold,512.6,277.3,76/63,500,1,0);
            }
        }
    }

    private createGlod(x: number, y: number,width:number,height:number):Phaser.GameObjects.Image{
        let glod = this.parentScene.add.image(x,y,"glod");
        glod.setDisplaySize(width,height);
        return glod;
    }

    private goldAni(glod,x:number,y:number,scale:number,duration:number,alpha:number=1,delay:number=0):void{
        var onCompleteHandler = ()=>{
            this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:glod,
                x:968.95,
                y:149.75,
                delay:1000,
                alpha:0,
                ease:"sine.easeInOut",
                duration:duration
            })
        }

        this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:glod,
            x:x,
            y:y,
            delay:delay,
            alpha:alpha,
            scale:scale,
            ease:"sine.easeInOut",
            duration:duration,
            onComplete:onCompleteHandler
        })
    }

}
