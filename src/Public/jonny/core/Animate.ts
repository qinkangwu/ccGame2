/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';

export class StaticAni {
    /**
     * @param {any} 传入Phaser.GameObjects的子对象
     * @param {number} 放大值
     * @param {number} 缩小值
     * @param {number} 透明值
     */
    public static alphaScaleFuc(obj:any, _scaleX: number, _scaleY: number, _alpha: number): void {
        obj.scaleX = _scaleX;
        obj.scaleY = _scaleY;
        obj.alpha = _alpha;
    }
}

export class TweenAni {
    /**
     * @param {Phaser.Scene}
     * @param {Phaser.GameObjects.Image | Phaser.GameObjects.Container}
     * @param {number} x轴的放大值
     * @param {number} y轴的放大值
     * @param {number} 透明值
     */
    public static alphaScaleYoyoFunc(scene: Phaser.Scene, obj: Phaser.GameObjects.Image | Phaser.GameObjects.Container, scaleX: number, scaleY: number, alpha: number) {
        scene.tweens.add({
            targets: obj,
            scaleX: scaleX,
            scaleY: scaleY,
            alpha: alpha,
            duration: 200,
            ease: 'Sine.easeInOut',
            yoyo: true
        })
    }

}

export const EASE = {
    spring: function (t) {
        let factor = 0.45;
        return Math.pow(2, -10 * t) * Math.sin((t - factor / 4) * (2 * Math.PI) / factor) + 1;
    },
    overshoot: function (t) {
        let tension = 2.0;
        t -= 1.0;
        let result = t * t * ((tension + 1) * t + tension) + 1.0;
        return result;
    }
}
