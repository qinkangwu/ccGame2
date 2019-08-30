import "phaser";
/**
 * @param scene 当前的场景
 * @param x 引导动画的x
 * @param y 引导动画的y
 */
export default class CreateGuideAnims {
    private scene; 
    private x ;
    private y ;
    private guideHands : Phaser.GameObjects.Image; //引导手
    private guideCircle : Phaser.GameObjects.Image; //引导圆环
    constructor(scene,x,y){
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.loadImg();
    }

    private init() : void {
        //引导动画
        this.guideHands = this.scene.add.image(this.x,this.y,'hands').setDisplaySize(94,72).setOrigin(.5).setDepth(1000);
        this.guideCircle = this.scene.add.image(this.guideHands.x - 50 , this.guideHands.y  , 'circle').setScale(.4).setOrigin(.5).setDepth(1001);
        this.scene.tweens.add({
            targets : this.guideHands,
            y : '+=16',
            angle : '-=15',
            repeat : -1,
            ease : 'Sine.easeInOut',
            yoyo : true,
            duration : 500
        });
        this.scene.tweens.add({
            targets : this.guideCircle,
            scaleX : .35,
            scaleY : .35, 
            duration : 500,
            repeat : -1,
            ease : 'Sine.easeInOut',
            yoyo : true,
        })
    }

    public hideHandle () : void {
        this.guideHands.alpha = 0;
        this.guideCircle.alpha = 0;
    }

    public showHandle () : void {
        this.guideHands.alpha = 1;
        this.guideCircle.alpha = 1;
    }

    private loadImg() : void {
        this.scene.load.image('hands','assets/Game7/hands.png');
        this.scene.load.image('circle','assets/Game7/circle.png');
        this.scene.load.on('complete',this.init.bind(this));
        this.scene.load.start();
    }
}