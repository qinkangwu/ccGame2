import "phaser";

export class Basin extends Phaser.GameObjects.Container {
    bg:Phaser.GameObjects.Image;
    text:Phaser.GameObjects.Text;
    name:string;
    constructor(scene: Phaser.Scene,name:string){
        super(scene);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"bg_basin");
        this.text = new Phaser.GameObjects.Text(scene,0,0,name,{align:"center",color:"#ffffff",resolution:2}).setOrigin(0.5);
        this.name = name;
        this.add([this.bg,this.text]);
    }

    public init():Basin{
        this.alpha = 0;
        this.x = 496;
        this.y = 505;
        return this;
    }

    /**
     * 淡出
     */
    public show():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                alpha:1,
                duration:500,
                onComplete:()=>{
                    this.audioPlay(this.name + "Sound");
                    resolve(1);
                }
            })
        })
    }

    /**
     * 移动到左边
     */
    public moveLeft():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                x:91,
                duration:500,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }

    /**
     * 移动到右边
     */
    public moveRight():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                x:761,
                duration:500,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
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