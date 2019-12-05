import "phaser";

export class Toy extends Phaser.GameObjects.Container {
    toyImg: Phaser.GameObjects.Image;
    target: Phaser.GameObjects.Image;
    name: string;
    shape: Phaser.Geom.Rectangle;
    isHit:boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string, toyImgTexture: string) {
        super(scene, x, y);
        this.toyImg = new Phaser.GameObjects.Image(scene, 0, 0, toyImgTexture);
        this.target = new Phaser.GameObjects.Image(scene, 0, 66, "img_mz");
        this.add([this.toyImg, this.target]);
        this.name = name;
    }

    public init(): Toy {
        this.shape = new Phaser.Geom.Rectangle(-90, -90, 180, 180);
        this.setInteractive(this.shape, Phaser.Geom.Rectangle.Contains);
        this.scale = 0;
        return this;
    }

    /**
     * @param {number} 延时出现的事件偏移值
     */
    public show(delay: number): Promise<any> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this,
                duration: 500,
                delay: delay,
                scale: 1,
                ease: "Sine.easeOut",
                onComplete: () => {
                    resolve(1);
                }
            })
        })
    }

    /**
     * 正确的反馈
     */
    public isRight(): Promise<any> {
        return new Promise(async resolve => {
            await this.audioPlay("right");
            await this.audioPlay(this.name + "Sound");
            this.scene.add.tween({
                targets: this.target,
                alpha: 0,
                duration: 500
            });
            this.scene.tweens.timeline({
                targets:this.toyImg,
                tweens:[
                    {
                        scale:1.2,
                        yoyo:true,
                        ease:"Sine.easeOut",
                        duration:500
                    },
                    {
                        y:"+=400",
                        yoyo:true,
                        ease:"Sine.easeOut",
                        duration:500
                    }
                ],
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }

    /**
     * 错误的反馈
     */
    public isWrong():Promise<number>{
        return new Promise<number>(async resolve => {
            await this.audioPlay("wrong");
            this.scene.tweens.timeline({
                targets: this.target,
                duration:200,
                tweens:[
                    {
                        x:-10
                    },
                    {
                        x:0
                    },
                    {
                        x:-10
                    }
                ],
                onComplete:()=>{
                    resolve(1);
                }
            });
        })
    }

    /**
     * 单次播放的音频播放器
     */
    private audioPlay(key: string): Promise<number> {
        return new Promise<number>(resolve => {
            let _tempSound: Phaser.Sound.BaseSound = this.scene.sound.add(key);
            _tempSound.on("complete", function (this: Phaser.Sound.BaseSound) {
                this.destroy();
                resolve(1);
            });
            _tempSound.play();
        })
    }


}