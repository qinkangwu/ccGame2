import "phaser";
const W = 1024;
const H = 552;

/**
 * @param scene 场景
 * @param total 总的单词数
 */
export default class PlanAnims {
    private scene : Phaser.Scene;
    private total : number ; 
    private planObj : Phaser.GameObjects.Image; //飞机
    private current : number = 1 ; //当前的索引 最小为1 
    private currentText : Phaser.GameObjects.Text; //当前文本
    private totalText : Phaser.GameObjects.Text; //总的文本
    private graphicsObj : Phaser.GameObjects.Graphics; //遮罩
    private planTween : Phaser.Tweens.Tween ; //飞机动画tween
    private cloud : Phaser.GameObjects.Image ; //云
    private splitIcon : Phaser.GameObjects.Image; //分隔符
    private lock : boolean ; //节流锁
    constructor(scene : Phaser.Scene , total : number){
        this.scene = scene;
        this.total = total;
    }

    public show (current : number,cb? : Function) : void {
        if(this.lock ) return;
        current > 0 && (this.current = current);
        this.lock = true;
        this.createMask();
        this.planObj = this.scene.add.image(W - 111, H/2 - 20 , 'plan')
            .setOrigin(.5)
            .setDepth(999);
        this.cloud = this.scene.add.image(W / 2 , H / 2 , 'cloud')
            .setOrigin(.5)
            .setDepth(999)
            .setScale(0);
        this.splitIcon = this.scene.add.image(this.cloud.x - (this.current > 9 && -10 || 10), this.cloud.y + 15 , 'splitIcon')
            .setOrigin(.5)
            .setDepth(999)
            .setAlpha(0)
        this.currentText = this.scene.add.text(this.splitIcon.x - (this.current > 9 && 40 || 25 ) , this.splitIcon.y - 7,this.current + '' , {
            fontSize: "56px",
            fontFamily:"Arial Rounded MT Bold",
            fill : '#FF8D39',
        }).setOrigin(.5).setDepth(1000).setAlpha(0);
        this.totalText = this.scene.add.text(this.splitIcon.x + 30 , this.splitIcon.y , this.total + '', {
            fontSize: "32px",
            fontFamily:"Arial Rounded MT Bold",
            fill : '#63BFFF',
        }).setOrigin(.5).setDepth(1000).setAlpha(0);
        this.planTween = this.scene.tweens.add({
            targets : this.planObj,
            ease : 'Sine.easeInOut',
            duration : 300,
            repeat : -1,
            y : `+=14`,
            yoyo : true
        });
        this.scene.tweens.add({
            targets : this.planObj,
            ease : 'Sine.easeOut',
            duration : 300,
            x : W / 2 + 150
        });
        this.scene.tweens.add({
            targets : this.planObj,
            delay : 300,
            ease : 'Linear',
            duration : 500,
            x : `-=200`
        });
        this.scene.tweens.add({
            targets : [this.cloud],
            delay : 1000,
            scaleX : 1,
            scaleY : 1 ,
            ease : 'Sine.easeIn',
            duration : 300,
            onComplete : ()=>{
                this.scene.tweens.add({
                    targets : [this.splitIcon,this.currentText,this.totalText],
                    duration : 150,
                    alpha : 1,
                    ease : 'Sine.easeIn'
                })
            }
        });
        this.scene.tweens.add({
            targets : this.planObj,
            delay : 800,
            x : `-=${W}`,
            ease : 'Sine.easeInOut',
            duration : 1000,
            onComplete : this.animsStop.bind(this,cb)
        })
    }

    private animsStop (cb : Function) : void {
        this.scene.tweens.add({
            targets : [this.cloud,this.splitIcon,this.currentText,this.totalText],
            alpha : 0 ,
            x : `+=50`,
            duration : 500,
            ease : 'Sine.easeInOut',
            onComplete : ()=>{
                this.planTween && this.planTween.stop && this.planTween.stop();
                this.scene.tweens.remove(this.planTween);
                this.graphicsObj && this.graphicsObj.clear();
                this.graphicsObj && this.graphicsObj.destroy();
                this.graphicsObj = null;
                this.planObj && this.planObj.destroy();
                this.planObj = null;
                this.lock = false;
                cb && cb.call(this.scene);
            }
        })
    }

    private createMask () : void {
        //创建开始游戏遮罩
        this.graphicsObj = this.scene.add.graphics();
        this.graphicsObj.fillStyle(0x000000,.8);
        this.graphicsObj.fillRect(0,0,1024,552).setDepth(998);
    }

    public static loadImg(scene) : void {
        //多个全局组件load.start会出现未知bug 采用在组件内部preload调用此函数加载资源
        scene.load.image('plan','assets/commonUI/plan.png');
        scene.load.image('splitIcon','assets/commonUI/splitIcon.png');
        scene.load.image('cloud','assets/commonUI/cloud.png');
    }
}