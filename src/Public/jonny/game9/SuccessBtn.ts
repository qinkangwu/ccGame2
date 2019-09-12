import "phaser";

export class SuccessBtn extends Phaser.GameObjects.Image{
    public animate:Phaser.Tweens.Tween;
    public interactive:boolean = true;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene, x, y, texture);
        this.animate = this.scene.add.tween({
            targets: this,
            scale: 1.2,
            repeat: 2,
            yoyo: true,
            duration: 500,
            paused:false,
            ease: "Sine.easeIn"
        })
        this.setInteractive();
    }
} 