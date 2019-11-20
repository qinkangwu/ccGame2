/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";
import { Vec2 } from "../core"

interface PTOP {
    initPosition: Vec2;
    targetPosition: Vec2;
}

class DartConfig {
    isRight: PTOP;
    isWrong: PTOP;
    constructor(_isRight: PTOP, _isWrong: PTOP) {
        this.isRight = _isRight;
        this.isWrong = _isWrong;
    }
}

let defaultDartConfig = new DartConfig(
    { initPosition: new Vec2(770, -9), targetPosition: new Vec2(606, 258) },
    { initPosition: new Vec2(1015, -9), targetPosition: new Vec2(855, 258) }
);

export class Darts extends Phaser.GameObjects.Sprite {
    isRight:PTOP;
    isWrong:PTOP;
    constructor(scene: Phaser.Scene, dartConfig:DartConfig = defaultDartConfig) {
        super(scene, dartConfig.isRight.initPosition.x, dartConfig.isRight.initPosition.y, "img_fb","Darts0000");
        this.isRight = dartConfig.isRight;
        this.isWrong = dartConfig.isWrong;
        this.createAnims();
    }

    private createAnims(){
        this.scene.anims.create(<Phaser.Types.Animations.Animation>{
            key:"runing",
            frames:this.scene.anims.generateFrameNames("Darts",{
                prefix:"Darts00",
                start:0,
                end:14
            }),
            frameRate:24
        });
    }

    public getTrue():Promise<number>{
        return this.getTarget(this.isRight);
    }

    public getFalse():Promise<number>{
        return this.getTarget(this.isWrong);
    }

    private getTarget(isRW:PTOP):Promise<number>{
        return new Promise(resolve=>{
            this.setPosition(
                isRW.initPosition.x,
                isRW.initPosition.y,
            );
            this.setFrame("Darts0000");
            this.scene.add.tween({
                targets:this,
                x:isRW.targetPosition.x,
                y:isRW.targetPosition.y,
                duration:500,
                onStart:()=>{
                    this.anims.play("runing");
                },
                onComplete:()=>{
                    resolve(1);
                }
            })
        }) 
    }
}