import 'phaser';

import { Vec2,EASE } from "../core";

export class WordPop extends Phaser.GameObjects.Container {
    public bg:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    public offsetPosition:Vec2;
    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene,x,y);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"wordPop").setOrigin(0.83,1);
        this.text =  new Phaser.GameObjects.BitmapText(scene, -64, -40, "ArialRoundedBold", null, 23, 1).setOrigin(0.5);
        this.offsetPosition = new Vec2(65,-69);
        this.text.tint = 0xFF6E09;
        this.add([this.bg,this.text]);
        this.scale = 0;
    }

    public show(position:Vec2,textContent:string):Promise<any>{
        return new Promise(resolve=>{
            this.x = position.x + this.offsetPosition.x;
            this.y = position.y + this.offsetPosition.y;
            this.text.text = textContent;
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                scale: 1,
                duration: 500,
                ease: EASE.spring,
                onComplete: () => {
                    resolve(true);
                }
            });
        })
    }

    public syncPosition(x:number,y:number){
        this.setPosition(
            x + this.offsetPosition.x,
            y + this.offsetPosition.y
        );
    }
}