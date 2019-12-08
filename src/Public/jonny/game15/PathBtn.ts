/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import {Vec2 } from '../core/'

export class PathBtn extends Phaser.GameObjects.Image {
    public goalPosition: Phaser.Curves.QuadraticBezier;
    constructor(scene: Phaser.Scene, x: number, y: number, name: string, goalPosition: Phaser.Curves.QuadraticBezier) {
        super(scene, x, y, "pathBtn");
        this.alpha = 0;
        this.name = name;
        this.goalPosition = goalPosition;
        this.scene = scene;
        this.setInteractive();
    }

    public fadeIn(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                duration: 500,
                alpha: 1,
                onComplete: () => {
                    resolve(true);
                }
            });
        });
    }

    public fadeOut(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                duration: 500,
                alpha: 0,
                onComplete: () => {
                    resolve(true);
                }
            });
        });
    }

    public bounceAnimate(): void {
        this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: this,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: "Sine.easeInOut"
        });
    }
}