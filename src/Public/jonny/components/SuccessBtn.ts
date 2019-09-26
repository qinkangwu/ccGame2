import "phaser";

/**
 * 默认缩小0.7，透明度为0,使用.animate.play()，出现动画
 * @param {Phaser.Scene} scene 
 * @param {number} x
 * @param {number} y
 * @function animate.play
 */
export class SuccessBtn extends Phaser.GameObjects.Image{
    public animate:Phaser.Tweens.Tween;
    public interactive:boolean = true;
    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene, x, y, "successBtn");
        this.init();
        this.animate = this.scene.add.tween({
            targets: this,
            scale: 1.2,
            repeat: -1,
            yoyo: true,
            duration: 500,
            paused:true,
            ease: "Sine.easeIn",
            onStart:()=>{
                this.setAlpha(1);
            }
        })
        this.setInteractive();
    }

    public init():void{
        this.setScale(0.7).setAlpha(0);
    }

    public static loadImg(scene:Phaser.Scene){
        scene.load.image("successBtn","assets/commonUI/successBtn.png");
    }

    
} 