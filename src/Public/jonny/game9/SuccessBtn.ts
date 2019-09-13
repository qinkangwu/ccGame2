import "phaser";

export class SuccessBtn extends Phaser.GameObjects.Image{
    public animate:Phaser.Tweens.Tween;
    public interactive:boolean = true;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene, x, y, texture);
        this.init();
        this.animate = this.scene.add.tween({
            targets: this,
            scale: 1.2,
            repeat: -1,
            yoyo: true,
            duration: 500,
            paused:false,
            ease: "Sine.easeIn"
        })
        this.setInteractive();
    }

    public init():void{
        this.setScale(0.7).setAlpha(0);
    }

    
} 