/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";

export class ClearCar extends Phaser.GameObjects.Image{
  public light: Phaser.GameObjects.Image;      //光
    constructor(scene: Phaser.Scene){
        super(scene,560,347,"clearCar");
        this.light = new Phaser.GameObjects.Image(scene,216,347,"light").setDepth(2).setScale(0);
        scene.add.existing(this.light);
        this.init();
    }

    private init(){
        this.setDepth(1).setVisible(false);
    }

     /**
     * 闪光
     */
    public flash(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.light,
                scale: 2,
                alpha:0,
                x:868,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    /**
     * 离场
     */
    public leave(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween({
                targets: this,
                x:-373,
                delay:1000,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

   
}