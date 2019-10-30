import "Phaser";

export class SentenceUI extends Phaser.GameObjects.Container{
    public bg:Phaser.GameObjects.Graphics;
    public text:Phaser.GameObjects.BitmapText;
    constructor(scene: Phaser.Scene,text:string){
        super(scene,1024*0.5,552*0.5);
        this.bg = new Phaser.GameObjects.Graphics(scene);
        this.bg.fillStyle(0xffffff).fillRoundedRect(0 - 864*0.5,0 - 138.5 * 0.5,864,138.5,69);
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, 0, "ArialRoundedBold", text, 65 - text.match(/\w+\b/g).length*3 ).setOrigin(0.5);
        this.text.tint = 0xFF6E09;
        this.setScale(0);
        this.add([this.bg,this.text]);
    }

    public admission():Promise<number>{
        return new Promise<number>(resolve=>{
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:this,
                duration:500,
                ease:"Sine.easeOut",
                scale:1,
                onComplete:()=>{
                   resolve(1); 
                }
            })
        })
    }

    public leave():Promise<number>{
        return new Promise<number>(resolve=>{
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:this,
                duration:500,
                ease:"Sine.easeOut",
                scale:0,
                onComplete:()=>{
                   resolve(1); 
                }
            })
        })
    }
}