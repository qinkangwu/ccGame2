/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";

export class IndexText extends Phaser.GameObjects.Container {
    particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    emitZone: Phaser.Geom.Rectangle;
    text: Phaser.GameObjects.BitmapText;
    constructor(scene: Phaser.Scene) {
        super(scene, 485, 339.5-45);
        this.text = new Phaser.GameObjects.BitmapText(scene, 60, 50, "AlibabaNumber200", null, 220, 1).setOrigin(0.5).setRotation((Math.PI / 180) * -25);
        this.particles = this.scene.add.particles("circle").setDepth(5);
        this.emitZone = new Phaser.Geom.Rectangle(this.x - 500 * 0.5, this.y - 500 * 0.5, 500, 500);
        this.emitter = this.particles.createEmitter({
            speed: { min: 1000, max: 2000 },
            lifespan: 500,
            quantity: 2,
            scale: { min: 1, max: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            moveToX: this.x,
            moveToY: this.y,
            emitZone: { source: this.emitZone },
            on: false
        });
        this.add(this.text);

        this.scene.add.existing(this.particles);
    }

    public show(textContent: string): Promise<boolean> {
        return new Promise(resolve => {
            //this.text.setText(textContent).setScale(0).setAlpha(0);
            this.text.setText('T.F').setScale(0).setAlpha(0);
            //this.emitter.start();
            this.scene.add.tween({
                targets: this.text,
                scale: 1,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                    this.emitter.stop();
                    setTimeout(() => {
                        resolve(true);
                    }, 2000);
                }
            });
        })
    }

    public hide(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this.text,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    resolve(true);
                }
            })
        })
    }
}