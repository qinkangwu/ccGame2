/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";
import {EASE} from "../core/";

export class WaterGun extends Phaser.GameObjects.Image {
    public particles:Phaser.GameObjects.Particles.ParticleEmitterManager;
    public emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        super(scene, 213.5 + 65.5 * 0.5, -255 * 0.5, "waterGun");
        this.particles = new Phaser.GameObjects.Particles.ParticleEmitterManager(scene,"flares").setDepth(2);
        scene.add.existing(this.particles);
        this.init();
    }

    private init() {
        this.setDepth(1).setVisible(true);
        this.emitter = this.particles.createEmitter({
            frame: ['white','red','blue','green','yellow'],
            x:213.5+65.5,
            y:255,
            lifespan: 4000,
            speedX: { min: 0, max:1024 },
            speedY: { min: 0, max: 552 },
            scale: { start: 0, end: 1 },
            alpha:{start:0.7,end:0},
            quantity: 4,
            blendMode: 'ADD',
            on:false
        });
    }

    /**
    * 入场
    */
    public admission(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                y: 255 * 0.5,
                delay: 500,
                duration: 500,
                ease:EASE.spring,
                onComplete: () => {
                    this.emitter.stop();
                    resolve(1);
                }
            });
        })
    }

    /**
     * 工作
     */
    public boom(): Promise<number>{
        this.emitter.start();
        return new Promise<number>(resolve => {
            setTimeout(()=>{
                this.emitter.stop();
                resolve(1);
            },6000);
        })
    }

    /**
    * 离场
    */
    public leave(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                y: -255 * 0.5,
                delay: 500,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}