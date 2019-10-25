import "phaser";

/**
 * @param {Phaser.Scene} scene 
 * @param {string} texture "pentagram","square","triangle"
 * @param {string} frame [option] 
 */

export class Particles extends Phaser.GameObjects.Particles.ParticleEmitterManager {
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    constructor(scene: Phaser.Scene, texture: string, frame?: string | number) {
        super(scene, texture, frame);
        this.emitter = this.createEmitter(<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig>{
            lifespan: 1000,   //寿命
            speed: { min: 300, max: 400 },
            alpha: { start: 0.7, end: 0 },
            scale: { start: 0.7, end: 0 },
            rotate: { start: 0, end: 360, ease: 'Power2' },
            blendMode: 'ADD',
            tint: [0xff0000, 0x00ff00, 0x0000ff],
            on: false
        });
    }

    public boom(x: number = 0, y: number = 0, count: number = 40): void {
        this.emitter.explode(count, x, y);
    }

    public static loadImg(scene: Phaser.Scene) {
        scene.load.image("pentagram", "assets/commonUI/pentagram30.png");
        scene.load.image("square", "assets/commonUI/square30.png");
        scene.load.image("triangle", "assets/commonUI/triangle30.png");
    }
}