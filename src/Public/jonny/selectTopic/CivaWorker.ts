/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */
import "phaser";

export class CivaWorker extends Phaser.GameObjects.Sprite {
    private time: number = 0;
    public initVec2:{x:number;y:number};
    public asBeeDanceAnimate: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
        super(scene, x, y, texture, frame);
        this.initVec2 = {
            x:this.x,
            y:this.y
        }
    }

    /**
     * 作为一名魔法师
     */
    public asWizard(): CivaWorker {
        this.scene.anims.create({
            key: "fly",
            frames: this.scene.anims.generateFrameNames("wizard", { prefix: "Wizard00", start: 0, end: 14 }),
            repeat: -1,
            yoyo:true,
            frameRate:18
        });
        this.play("fly");
        
        return this;
    }

    /**
     * 静态离场
     */
    public staticLeave(offsetX:number):this{
        this.x += offsetX;
        return this;
    }

    /**
     * 动态入场
     */
    public admission():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                x:this.initVec2.x,
                duration:400,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }

    /**
     * 作为一名蜜蜂
     */
    public asBee(): CivaWorker {
        this.scene.anims.create({
            key: "flight",
            frames: this.scene.anims.generateFrameNames("civaBee", { prefix: "civaBee000", start: 0, end: 1 }),
            repeat: -1,
            frameRate:8 
        });
        this.play("flight");
        return this;
    }

    /**
     * 当蜜蜂进行跳舞
     */
    public asBeeDance() {
        this.asBeeDanceAnimate = this.scene.add.tween({
            targets: this,
            y: "+=10",
            repeat: -1,
            duration: 500,
            yoyo: true,
            onUpdate: () => {
                this.time += 0.2;
                this.x += Math.sin(this.time);
            }
        });
    }

    /**
     * 当蜜蜂进行工作
     */
    public asBeeWorking(x: number, y: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.scene.tweens.timeline({
                targets: this,
                tweens: [
                    {
                        x: x,
                        y: y,
                        duration: 1500,
                        onUpdate: () => {
                            this.time += 0.1;
                            this.x += Math.sin(this.time) * 10;
                        }
                    }
                ],
                onComplete: () => {
                    this.anims.stop();
                    resolve(true);
                }
            })
        });

    }

    /**
     * 正确
     */
    public isRight(){
        this.scene.add.tween({
            targets:this,
            scale:1.5,
            alpha:0.5,
            yoyo:true,
            duration:500
        })
    }

     /**
     * 错误
     */
    public isWrong(){
        this.scene.add.tween({
            targets:this,
            scale:0.5,
            alpha:0,
            yoyo:true,
            duration:500
        })
    }

    /**
     * 离场
     */
    public leave():Promise<number>{
        return new Promise(resolve=>{
            let offsetX:number;
            if(this.initVec2.x > 1024*0.5){
                offsetX = this.initVec2.x+=400;
            }else{
                offsetX = this.initVec2.x-=400; 
            }
            this.scene.add.tween({
                targets:this,
                x:offsetX,
                duration:400,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }
}