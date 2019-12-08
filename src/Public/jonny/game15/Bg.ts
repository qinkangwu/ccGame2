/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';

export class Bg extends Phaser.GameObjects.Container{
    public bg1:Phaser.GameObjects.Image;
    public bg2:Phaser.GameObjects.Image;
    public bg3:Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene){
        super(scene);
        this.bg1 = new Phaser.GameObjects.Image(scene,-1024,0,"bg");
        this.bg2 = new Phaser.GameObjects.Image(scene,0,0,"bg");
        this.bg3 = new Phaser.GameObjects.Image(scene,1024,0,"bg");
        this.add([this.bg1,this.bg2,this.bg3]);
        this.animate();
    }

    private animate():void{
        this.scene.add.tween(< Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:this.list,
            duration:9000,
            ease:"Linear",
            x:"+=1024",
            repeat:-1,
            onUpdate:()=>{
                (this.list as Phaser.GameObjects.Image[]).forEach(img=>{
                    if(img.x>2048){
                        img.x = - 1024;
                    }
                })
            }
        })
    }
} 