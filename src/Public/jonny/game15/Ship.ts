import 'phaser';

import { Bounds, Vec2 } from "../core";

export class Ship extends Phaser.GameObjects.Container {
    public bgNull: Phaser.GameObjects.Image;
    public bg: Phaser.GameObjects.Image;
    public text: Phaser.GameObjects.BitmapText;
    public shape: Phaser.Geom.Rectangle;
    public swicthAnimateTween: Phaser.Tweens.Tween;
    public initPosition: Vec2;
    public complete: boolean = false;
    public carriageName: string;
    constructor(scene: Phaser.Scene, x: number, y: number, textContent: string) {
        super(scene, x, y);
        this.bgNull = new Phaser.GameObjects.Image(scene, 0, 0, "shipNull");
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "ship");
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, 50, "yuantiChinese", textContent, 17, 1).setOrigin(0.5);
        this.initPosition = new Vec2(x, y);
        this.name = textContent;
        this.shape = new Phaser.Geom.Rectangle(-this.bg.width * 0.5, -this.bg.height * 0.5, this.bg.width, this.bg.height);
        this.add([this.bgNull, this.bg, this.text]);
        this.swicthAnimateTween = this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: this,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            paused: true
        });
        //this.init();
    }

    // private init():void{
    //     this.setInteractive(this.shape, <Phaser.Types.Input.HitAreaCallback>Phaser.Geom.Rectangle.Contains);
    //     this.scene.input.setDraggable(this, true);
    //     //this.drawHitArea();
    // }

    // private drawHitArea():void{
    //     let graphics = new Phaser.GameObjects.Graphics(this.scene);
    //     graphics.lineStyle(1, 0x0000ff);
    //     graphics.strokeRect(this.shape.x, this.shape.y, this.shape.width,this.shape.height);
    //     this.add(graphics);
    // }

    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }

    public bounceAnimate(): Promise<boolean> {
        return new Promise(resolve => {
            return this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                scale: 1.2,
                duration: 200,
                yoyo: true,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    resolve(true);
                }
            });
        })
    }

    public gotoTerminal(curve: Phaser.Curves.QuadraticBezier): Promise<boolean> {
        return new Promise(resolve => {
            let path = {
                t: 0,
                vec: new Phaser.Math.Vector2()
            }
            this.scene.add.tween({
                ease: 'Linear',
                duration: 2000,
                targets: path,
                t: 1,
                onUpdate: () => {
                    curve.getPoint(path.t, path.vec);
                    this.setPosition(path.vec.x, path.vec.y);
                },
                onComplete: () => {
                    setTimeout(() => {
                        resolve(true);
                    }, 500);
                }
            });
        })
    }

    public scaleMin(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.tweens.add({
                duration: 500,
                targets: this,
                scale: 0,
                alpha: 0,
                x: "+=100",
                onComplete: () => {
                    resolve(true);
                }
            });
        })
    }

}