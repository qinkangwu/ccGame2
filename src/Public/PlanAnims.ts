import "phaser";
const W = 1024;
const H = 552;

/**
 * @param scene 场景
 * @param total 总的单词数
 * @param cb 展示动画完成回调
 */
export default class PlanAnims {
    private scene : Phaser.Scene;
    private total : number ; 
    private cb : Function ;
    private planObj : Phaser.GameObjects.Image; //飞机
    private current : number = 1 ; //当前的索引 最小为1 
    private currentText : Phaser.GameObjects.Text; //当前文本
    private graphicsObj : Phaser.GameObjects.Graphics; //遮罩
    private planTween : Phaser.Tweens.Tween ; //飞机动画tween
    private cloud : Phaser.GameObjects.Image ; //云
    private splitIcon : Phaser.GameObjects.Image; //分隔符
    private lock : boolean ; //节流锁
    constructor(scene : Phaser.Scene , total : number,cb? : Function){
        this.scene = scene;
        this.total = total;
        this.cb = cb || null;
    }

    public show () : void {
        if(this.lock ) return;
        this.lock = true;
        this.createMask();
        this.planObj = this.scene.add.image(W - 111, H/2 - 20 , 'plan')
            .setOrigin(.5)
            .setDepth(999);
        this.cloud = this.scene.add.image(W / 2 , H / 2 , 'cloud')
            .setOrigin(.5)
            .setDepth(999)
            .setScale(1);
        this.splitIcon = this.scene.add.image(this.cloud.x + 5 , this.cloud.y + 5 , 'splitIcon')
            .setOrigin(.5)
            .setDepth(999)
            .setScale(1)
        this.planTween = this.scene.tweens.add({
            targets : this.planObj,
            ease : 'Sine.easeInOut',
            duration : 300,
            repeat : -1,
            y : `+=20`,
            yoyo : true
        });
        this.scene.tweens.add({
            targets : this.planObj,
            ease : 'Sine.easeInOut',
            duration : 300,
            x : W / 2 + 150
        });
        this.scene.tweens.add({
            targets : this.planObj,
            delay : 300,
            ease : 'Sine.easeInOut',
            duration : 1000,
            x : `-=200`
        });
        this.scene.tweens.add({
            targets : this.planObj,
            delay : 1200,
            x : `-=${W}`,
            ease : 'Sine.easeInOut',
            duration : 1000,
            onComplete : this.animsStop.bind(this)
        })
    }

    private animsStop () : void {
        this.planTween && this.planTween.stop && this.planTween.stop();
        this.scene.tweens.remove(this.planTween);
        this.graphicsObj && this.graphicsObj.clear();
        this.graphicsObj && this.graphicsObj.destroy();
        this.graphicsObj = null;
        this.planObj && this.planObj.destroy();
        this.planObj = null;
        this.lock = false;
        this.cb && this.cb.call(this);
    }

    private createMask () : void {
        //创建开始游戏遮罩
        this.graphicsObj = this.scene.add.graphics();
        this.graphicsObj.fillStyle(0x000000,.7);
        this.graphicsObj.fillRect(0,0,1024,552).setDepth(998);
    }

    public static loadImg(scene) : void {
        //多个全局组件load.start会出现未知bug 采用在组件内部preload调用此函数加载资源
        scene.load.image('plan','assets/commonUI/plan.png');
        scene.load.image('splitIcon','assets/commonUI/splitIcon.png');
        scene.load.image('cloud','assets/commonUI/cloud.png');
    }
}