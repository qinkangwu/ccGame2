/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";

/**
 * @param {Pahser.Scene}
 */
export class Firework extends Phaser.GameObjects.Particles.ParticleEmitterManager{
    public emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    constructor(scene: Phaser.Scene) {
        super(scene,"particleShape");
        this.emitter = this.createEmitter(<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig>{
            frame:["particleShape0003","particleShape0004","particleShape0005","particleShape0006"],
            x: {min:0,max:1024},
            y: 10,
            angle: { min: 180, max: 360 },
            speed: 200,
            gravityY: 600,
            lifespan: 3000,
            quantity: 4,
            tint:[0xff0000,0x00ff00,0x0000ff],
            scale:0.1,
            maxParticles:500,
            on:false
        });
    }

    public play():Promise<number>{
        return new Promise(resolve => {
            this.emitter.start();
            setTimeout(()=>{
                this.emitter.stop();
                resolve(1);
            },2000)
        });
    }

    public static loadImg(scene: Phaser.Scene) {
        scene.load.atlas('particleShape', 'assets/commonUI/particleShape.png', 'assets/commonUI/particleShape.json');
    }
}