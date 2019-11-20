import "phaser";

export class CivaWorker extends Phaser.GameObjects.Sprite {
    private time: number = 0;
    public asBeeDanceAnimate: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
        super(scene, x, y, texture, frame);
    }

    /**
     * 作为一名魔法师
     */
    public asWizard(): CivaWorker {
        this.scene.anims.create({
            key: "fly",
            frames: this.scene.anims.generateFrameNames("wizard", { prefix: "Wizard00", start: 0, end: 14 }),
            repeat: -1,
            yoyo:true,
            frameRate:25
        });
        this.play("fly");
        
        return this;
    }


    /**
     * 作为一名蜜蜂
     */
    public asBee(): CivaWorker {
        this.scene.anims.create({
            key: "flight",
            frames: this.scene.anims.generateFrameNames("civaBee", { prefix: "civaBee000", start: 0, end: 1 }),
            repeat: -1,
            frameRate:8 
        });
        this.play("flight");
        return this;
    }

    /**
     * 当蜜蜂进行跳舞
     */
    public asBeeDance() {
        this.asBeeDanceAnimate = this.scene.add.tween({
            targets: this,
            y: "+=10",
            repeat: -1,
            duration: 500,
            yoyo: true,
            onUpdate: () => {
                this.time += 0.2;
                this.x += Math.sin(this.time);
            }
        });
    }

    /**
     * 当蜜蜂进行工作
     */
    public asBeeWorking(x: number, y: number): Promise<boolean> {
        this.asBeeDanceAnimate.stop();
        return new Promise<boolean>(resolve => {
            this.scene.tweens.timeline({
                targets: this,
                tweens: [
                    {
                        x: x,
                        y: y,
                        duration: 1500,
                        onUpdate: () => {
                            this.time += 0.1;
                            this.x += Math.sin(this.time) * 10;
                        }
                    }
                ],
                onComplete: () => {
                    this.anims.stop();
                    resolve(true);
                }
            })
        });

    }
}