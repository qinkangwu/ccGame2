/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";

const FACTOR = 0.7;


export class Door extends Phaser.GameObjects.Container {
    public purple: Phaser.GameObjects.Image;
    public yellow: Phaser.GameObjects.Image;
    public devil: Phaser.GameObjects.Image;
    public angel: Phaser.GameObjects.Image;
    public leftText: Phaser.GameObjects.Image;
    public rightText: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene) {
        super(scene);

        this.purple = new Phaser.GameObjects.Image(scene, 1350, 276, "bg_purple");
        this.purple.setData("initPosition", { x: 1350, y: 276 });
        this.purple.setData("targetPosition", { x: 704, y: this.y });

        this.yellow = new Phaser.GameObjects.Image(scene, -317, 276, "bg_yellow");
        this.yellow.setData("initPosition", { x: -317, y: 276 });
        this.yellow.setData("targetPosition", { x: 322, y: this.y });

        this.devil = new Phaser.GameObjects.Image(scene, 915, -236, "civa_devil_01");
        this.devil.setData("initPosition", { x: 915, y: -236 });
        this.devil.setData("targetPosition", { x: this.x, y: 128 });

        this.angel = new Phaser.GameObjects.Image(scene, 203, 791, "civa_angle_01");
        this.angel.setData("initPosition", { x: 203, y: 791 });
        this.angel.setData("targetPosition", { x: this.x, y: 405 });

        this.leftText = new Phaser.GameObjects.Image(scene, 213, -107, "T.Angel").setRotation((Math.PI / 180) * -25);
        this.leftText.setData("initPosition", { x: 213, y: -107 });
        this.leftText.setData("targetPosition", { x: this.x, y: 111 });

        this.rightText = new Phaser.GameObjects.Image(scene, 811, 670, "F.Devil").setRotation((Math.PI / 180) * -25);
        this.rightText.setData("initPosition", { x: 811, y: 670 });
        this.rightText.setData("targetPosition", { x: this.x, y: 403 });

        this.add([this.purple, this.yellow, this.devil, this.angel, this.leftText, this.rightText]);
    }

    public initClose():Door {
        this.purple.x = this.purple.getData("targetPosition").x;
        this.yellow.x = this.yellow.getData("targetPosition").x;
        this.angel.y = this.angel.getData("targetPosition").y;
        this.devil.y = this.devil.getData("targetPosition").y;
        this.leftText.y = this.leftText.getData("targetPosition").y;
        this.rightText.y = this.rightText.getData("targetPosition").y;
        return this;
    }

    public initOpen():Door{
        this.purple.x = this.purple.getData("initPosition").x;
        this.yellow.x = this.yellow.getData("initPosition").x;
        this.angel.y = this.angel.getData("initPosition").y;
        this.devil.y = this.devil.getData("initPosition").y;
        this.leftText.y = this.leftText.getData("initPosition").y;
        this.rightText.y = this.rightText.getData("initPosition").y;
        return this; 
    }

    public close(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.purple,
                duration: 1000*FACTOR,
                x: this.purple.getData("targetPosition").x,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    resolve(true);
                }
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.yellow,
                duration: 1000*FACTOR,
                ease: "Sine.easeInOut",
                x: this.yellow.getData("targetPosition").x
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.angel,
                duration: 500*FACTOR,
                y: this.angel.getData("targetPosition").y
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.devil,
                duration: 500*FACTOR,
                y: this.devil.getData("targetPosition").y
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.leftText,
                duration: 250*FACTOR,
                y: this.leftText.getData("targetPosition").y
            })

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.rightText,
                duration: 250*FACTOR,
                y: this.rightText.getData("targetPosition").y
            })
        });
    }

    public open(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.purple,
                duration: 1000*FACTOR,
                x: this.purple.getData("initPosition").x,
                onComplete: () => {
                    resolve(true);
                }
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.yellow,
                duration: 1000*FACTOR,
                x: this.yellow.getData("initPosition").x
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.angel,
                duration: 500*FACTOR,
                y: this.angel.getData("initPosition").y
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.devil,
                duration: 500*FACTOR,
                y: this.devil.getData("initPosition").y
            });

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.leftText,
                duration: 250*FACTOR,
                y: this.leftText.getData("initPosition").y
            })

            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.rightText,
                duration: 250*FACTOR,
                y: this.rightText.getData("initPosition").y
            })
        });
    }


}