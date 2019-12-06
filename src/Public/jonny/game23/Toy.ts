/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn/guiyang
 */

import "phaser";
import { Basin } from './Basin';

export class Toy extends Phaser.GameObjects.Container {
    toyImg: Phaser.GameObjects.Image;
    target: Phaser.GameObjects.Image;
    name: string;
    shape: Phaser.Geom.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string, toyImgTexture: string) {
        super(scene, x, y);
        this.toyImg = new Phaser.GameObjects.Image(scene, 0, 0, toyImgTexture);
        this.target = new Phaser.GameObjects.Image(scene, 0, 66, "img_mz");
        this.add([this.toyImg, this.target]);
        this.name = name;
    }

    public init(): Toy {
        this.shape = new Phaser.Geom.Rectangle(-90, -90, 180, 180);
        this.setInteractive(this.shape, Phaser.Geom.Rectangle.Contains);
        this.alpha = 0;
        this.scale = 0;
        return this;
    }

    /**
     * @param {number} 延时出现的事件偏移值
     */
    public show(delay: number): Promise<any> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this,
                duration: 500,
                delay: delay,
                alpha: 1,
                scale: 1,
                ease: "Sine.easeOut",
                onComplete: () => {
                    resolve(1);
                }
            })
        })
    }

    /**
     * 正确的反馈
     * @param {number} 正确的次数，正常不会超过2次
     * @param {Basin} 该落入到的盆 
     */
    public isRight(rightTimes:number,basin: Basin): Promise<any> {
        let props = rightTimes === 1 ? {x:-10,rotation:Phaser.Math.DegToRad(-10)} : {x:0,rotation:Phaser.Math.DegToRad(0)};
        let basinIndex = rightTimes === 1 ? 0 : 1;
        return new Promise(async resolve => {
            let _x = this.toyImg.getWorldTransformMatrix().tx - basin.x;
            let _y = this.toyImg.getWorldTransformMatrix().ty - basin.y;
            this.remove(this.toyImg);
            basin.addAt(this.toyImg, basinIndex);
            this.toyImg.x = _x;
            this.toyImg.y = _y;
            this.scene.add.tween({
                targets: this.target,
                alpha: 0,
                duration: 500
            });
            this.scene.tweens.timeline({
                targets:this.toyImg,
                tweens:[
                    {
                        scale:1.2,
                        yoyo:true,
                        ease:"Sine.easeOut",
                        duration:500
                    },
                    {
                        x:props.x,
                        rotation:props.rotation,
                        y:-50,
                        ease:"Sine.easeOut",
                        duration:500,
                    }
                ],
                onComplete:()=>{
                    resolve(1);
                }
             })
        })
    }

    /**
     * 错误的反馈
     */
    public isWrong(): Promise<number> {
        return new Promise<number>(async resolve => {
            //await this.audioPlay("wrong");
            this.scene.tweens.timeline({
                targets: this.target,
                duration: 50,
                tweens: [
                    {
                        x: -10
                    },
                    {
                        x: 0
                    },
                    {
                        x: 10
                    },
                    {
                        x: 0
                    }
                ],
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}