import "phaser";
/**
 * @parame parentScene: Phaser.Scene; 
 * @parame currentIndex: number; 
 * @parame sceneName: string; 
 * @parame sceneData: any; 
 * @parame glodValue:number=3;暂时不作传递 
 */

export class TipsParticlesEmitterCallback {
    public parentScene: Phaser.Scene;
    public currentIndex: number;
    public sceneName: string;
    public nextIndex: number;
    public sceneData: any;
    public glodValue:number;

    private ohNoBtns:Phaser.GameObjects.Container;
    private golds:Phaser.GameObjects.Container;

    constructor(parentScene: Phaser.Scene, sceneName: string, currentIndex: number, sceneData: any,glodValue:number=3) {
        this.parentScene = parentScene;
        this.sceneName = sceneName;
        this.currentIndex = currentIndex;
        this.nextIndex = this.currentIndex += 1;
        this.sceneData = sceneData;
        this.glodValue = glodValue;
    }

    /**
     * 没有机会
     */
    public ohNo() {
        var btnChange = this.createBtn(339 + 99 * 0.5, 371 + 46 * 0.5, "btnChange", this.nextIndex);
        var btnAgainOnce = this.createBtn(572 + 132 * 0.5, 371 + 46 * 0.5, "btnAgainOnce", this.currentIndex);
        this.ohNoBtns = this.parentScene.add.container(0,0,[btnChange,btnAgainOnce]);
        this.ohNoBtns.y+=30;
        this.parentScene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:this.ohNoBtns,
            ease:'Linear',
            y:0,
            duration:500
        });
    }

    /**
     * 再试一次
     */
    public tryAgain() {
        var btnAgain = this.createBtn(447 + 132 * 0.5, 395 + 46 * 0.5, "btnAgain", this.currentIndex);
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

    private createBtn(x: number, y: number, texture: string, index: number): Phaser.GameObjects.Image {
        let btn = this.parentScene.add.image(x, y, texture);
        btn.name = texture;
        this.btnBindEvent(btn, index);
        return btn;
    }

    private btnBindEvent(btn: Phaser.GameObjects.Image, index: number): void {
        let that = this;
        btn.setInteractive();
        btn.on("pointerdown", function () {
            this.parentScene.scene.start(that.sceneName, {
                data: that.sceneData,
                index: index
            });
            btn.off("pointerdown");
            if(btn.name === "btnChange" || btn.name === "btnAgainOnce"){
                that.ohNoBtns.destroy();
            }else{
                btn.destroy();
            }
        })
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