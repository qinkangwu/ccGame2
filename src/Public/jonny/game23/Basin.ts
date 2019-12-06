/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn/guiyang
 */

import "phaser";
import { Vec2 } from '../core/';

export class Basin extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    name: string;
    initPosition: Vec2;
    constructor(scene: Phaser.Scene, name: string, i: number) {
        super(scene, 496, 505);
        this.initPosition = new Vec2(91 + i * 168, 505);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "bg_basin");
        this.text = new Phaser.GameObjects.Text(scene, 0, 0 + 7, name, { align: "center", color: "#2c98e6", resolution: 2, fontFamily: "sans-serif", fontSize: "18px" }).setOrigin(0.5);
        this.name = name;
        this.add([this.bg, this.text]);
    }

    public init(): Basin {
        this.alpha = 0;
        return this;
    }

    /**
     * 淡入
     */
    public show(): Promise<number> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            })
        })
    }

    /**
     * 淡出
     */
    public hide(): Promise<number> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            })
        })
    }

    /**
     * 离场
     */
    public leave(): Promise<number> {
        return this.move(-144);
    }

    /**
     * 回到预设位置
     */
    public admission() {
        this.alpha = 0;
        this.x = this.initPosition.x;
    }

    /**
     * 出现单词与玩具
     * @param {number} 输入延时的时间
     */
    public showWordToy(delay: number): Promise<number> {
        this.bg.alpha = 0;
        (this.list[0] as Phaser.GameObjects.Image).alpha = 0;
        (this.list[1] as Phaser.GameObjects.Image).y = -96;
        this.text.setColor("#ffffff");
        return new Promise(resolve => {
            this.scene.tweens.timeline({
                tweens: [
                    {
                        targets: this,
                        alpha: 1,
                        duration: 400,
                        ease: "Sine.easeOut"
                    },
                    {
                        targets: this.list[1],
                        scale: 1.2,
                        yoyo: true,
                        delay: delay,
                        duration: 400,
                        ease: "Sine.easeOut",
                        onStart: () => {
                            this.audioPlay(this.name + "Sound");
                        },
                        onComplete: () => {
                            resolve(1);
                        }
                    }
                ]
            });
        })
    }

    /**
     * 单次播放的音频播放器
     */
    private audioPlay(key: string): Promise<number> {
        return new Promise<number>(resolve => {
            let _tempSound: Phaser.Sound.BaseSound = this.scene.sound.add(key);
            _tempSound.on("complete", function (this: Phaser.Sound.BaseSound) {
                this.destroy();
                resolve(1);
            });
            _tempSound.play();
        })
    }


    /**
     * 移动到左边
     */
    public moveLeft(): Promise<number> {
        return this.move(91);
    }

    /**
     * 移动到右边
     */
    public moveRight(): Promise<number> {
        return this.move(761);
    }

    /**
    * 移动到中间
    */
    public moveCenter(): Promise<number> {
        return this.move(492);
    }

    /**
     * 移动到玩具的位置
     */
    public move(x: number): Promise<number> {
        return new Promise(resolve => {
            this.scene.add.tween({
                targets: this,
                x: x,
                duration: 500,
                ease: "Sine.easeOut",
                onComplete: () => {
                    resolve(1);
                }
            })
        })
    }



}