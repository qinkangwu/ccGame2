/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */
import "phaser";

export class Shooter extends Phaser.GameObjects.Image{
    constructor(scene: Phaser.Scene){
        super(scene,962,447.5,"civa");
    }

    leave():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                x:1024,
                duration:500,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }
}